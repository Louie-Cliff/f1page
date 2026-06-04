<script setup lang="ts">
type DeployStatus = {
  id: string
  state: string
  label: string
  progress: number
  branch?: string
  context?: string
  url?: string
  commitRef?: string
  commitMessage?: string
  deployTime?: number
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
  errorMessage?: string
}

type DeploySummary = {
  configured: boolean
  siteId?: string
  hasBuildHook: boolean
  hasAuthToken: boolean
  deploys: DeployStatus[]
  activeDeploy: DeployStatus | null
  stats: {
    recentCount: number
    successfulCount: number
    failedCount: number
    averageDeploySeconds: number | null
    latestPublishedAt: string | null
  } | null
}

const summary = ref<DeploySummary | null>(null)
const statusMessage = ref('')
const errorMessage = ref('')
const completionNotice = ref<{
  type: 'success' | 'error'
  message: string
} | null>(null)
const isLoading = ref(false)
const isTriggering = ref(false)
let pollTimer: number | undefined
let statusTimer: number | undefined
let postTriggerPollUntil = 0
let triggeredAt = 0

const visibleDeploy = computed(() => summary.value?.activeDeploy || summary.value?.deploys[0] || null)
const failedDeployStates = ['error', 'canceled', 'skipped', 'rejected']
const successfulDeployStates = ['ready']
const isVisibleDeployActive = computed(() =>
  visibleDeploy.value
    ? !failedDeployStates.includes(visibleDeploy.value.state) &&
      !successfulDeployStates.includes(visibleDeploy.value.state)
    : false
)
const isVisibleDeployFailed = computed(() =>
  visibleDeploy.value ? failedDeployStates.includes(visibleDeploy.value.state) : false
)
const isVisibleDeploySuccessful = computed(() =>
  visibleDeploy.value ? successfulDeployStates.includes(visibleDeploy.value.state) : false
)
const deployProgressClass = computed(() => {
  if (isVisibleDeployFailed.value) {
    return 'bg-house-error'
  }

  if (isVisibleDeploySuccessful.value) {
    return 'bg-house-success'
  }

  return 'bg-house-accent'
})
const completionNoticeClass = computed(() =>
  completionNotice.value?.type === 'success'
    ? 'border-house-success/40 bg-house-success-surface text-house-success'
    : 'border-house-error/40 bg-house-error-surface text-house-error'
)

const setTemporaryStatus = (message: string) => {
  statusMessage.value = message

  if (statusTimer) {
    window.clearTimeout(statusTimer)
  }

  statusTimer = window.setTimeout(() => {
    statusMessage.value = ''
  }, 6000)
}

const clearStatus = () => {
  statusMessage.value = ''

  if (statusTimer) {
    window.clearTimeout(statusTimer)
    statusTimer = undefined
  }
}

const shouldPollDeploys = () =>
  Boolean(summary.value?.activeDeploy || isTriggering.value || Date.now() < postTriggerPollUntil)
const isBuildInProgress = computed(() =>
  Boolean(isTriggering.value || summary.value?.activeDeploy || Date.now() < postTriggerPollUntil)
)

const deployIsFromCurrentTriggerWindow = (deploy: DeployStatus) => {
  if (!triggeredAt || !deploy.createdAt) {
    return false
  }

  return new Date(deploy.createdAt).getTime() >= triggeredAt - 5000
}

const formatDate = (value?: string | null) => {
  if (!value) {
    return 'Not available yet'
  }

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

const formatDuration = (seconds?: number | null) => {
  if (!seconds) {
    return 'Not available'
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return minutes ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`
}

const formatBuildReference = (deploy: DeployStatus) =>
  deploy.commitRef ? deploy.commitRef.slice(0, 7) : deploy.id.slice(0, 7)

const dismissCompletionNotice = () => {
  completionNotice.value = null
}

const setCompletionNotice = (deploy: DeployStatus) => {
  if (failedDeployStates.includes(deploy.state)) {
    completionNotice.value = {
      type: 'error',
      message: deploy.errorMessage
        ? `Deploy failed: ${deploy.errorMessage}`
        : `Deploy finished with status: ${deploy.label}.`
    }

    return
  }

  if (successfulDeployStates.includes(deploy.state)) {
    completionNotice.value = {
      type: 'success',
      message: `Deploy complete. The latest production build is now live.`
    }
  }
}

const fetchDeploys = async () => {
  isLoading.value = !summary.value
  errorMessage.value = ''

  try {
    summary.value = await $fetch<DeploySummary>('/api/netlify/deploys')

    if (
      visibleDeploy.value &&
      !summary.value.activeDeploy &&
      deployIsFromCurrentTriggerWindow(visibleDeploy.value) &&
      (failedDeployStates.includes(visibleDeploy.value.state) ||
        successfulDeployStates.includes(visibleDeploy.value.state))
    ) {
      clearStatus()
      setCompletionNotice(visibleDeploy.value)
      postTriggerPollUntil = 0
      triggeredAt = 0
    }
  } catch (error) {
    errorMessage.value =
      (error as { statusMessage?: string })?.statusMessage ||
      'Netlify deploy status could not be loaded.'
  } finally {
    isLoading.value = false
  }
}

const triggerBuild = async () => {
  isTriggering.value = true
  triggeredAt = Date.now()
  postTriggerPollUntil = Date.now() + 120000
  errorMessage.value = ''
  completionNotice.value = null
  clearStatus()
  setTemporaryStatus('Build requested. Waiting for Netlify to enqueue it...')

  try {
    const response = await $fetch<{ summary?: DeploySummary | null }>('/api/netlify/build', {
      method: 'POST',
      body: {
        title: 'Triggered from Storyblok admin'
      }
    })

    if (response.summary) {
      summary.value = response.summary
    }

    setTemporaryStatus(
      summary.value?.hasAuthToken
        ? 'Build triggered. Status will update automatically.'
        : 'Build triggered. Add a Netlify API token to show live status and history.'
    )

    await fetchDeploys()
  } catch (error) {
    errorMessage.value =
      (error as { statusMessage?: string })?.statusMessage ||
      'Netlify build could not be triggered.'
  } finally {
    isTriggering.value = false
  }
}

onMounted(async () => {
  await fetchDeploys()

  pollTimer = window.setInterval(() => {
    if (shouldPollDeploys()) {
      fetchDeploys()
    }
  }, 5000)
})

onBeforeUnmount(() => {
  if (pollTimer) {
    window.clearInterval(pollTimer)
  }

  if (statusTimer) {
    window.clearTimeout(statusTimer)
  }
})
</script>

<template>
  <section
    class="grid gap-5 border border-house-border bg-house-surface p-4"
    aria-labelledby="netlify-deploy-heading"
  >
    <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <p class="text-xs font-bold uppercase text-house-text-muted">
          Netlify
        </p>
        <h2 id="netlify-deploy-heading" class="mt-1 text-lg font-bold text-house-text">
          Deploy site
        </h2>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-house-text-muted">
          Trigger a production build after content changes, then watch the latest main branch deploy status.
        </p>
      </div>
      <button
        class="button-primary justify-center"
        :class="{ 'is-disabled opacity-50': isBuildInProgress }"
        type="button"
        :data-build-in-progress="isBuildInProgress ? 'true' : undefined"
        :disabled="isLoading || isBuildInProgress || summary?.hasBuildHook === false"
        @click="triggerBuild"
      >
        {{ isBuildInProgress ? 'Build in progress' : 'Build site' }}
      </button>
    </div>

    <p
      v-if="statusMessage"
      class="border border-house-success/40 bg-house-success-surface p-3 text-sm font-semibold text-house-success"
      role="status"
    >
      {{ statusMessage }}
    </p>
    <p
      v-if="errorMessage"
      class="border border-house-error/40 bg-house-error-surface p-3 text-sm font-semibold text-house-error"
      role="alert"
    >
      {{ errorMessage }}
    </p>
    <div
      v-if="completionNotice"
      class="flex items-start justify-between gap-4 border p-3 text-sm font-semibold"
      :class="completionNoticeClass"
      :role="completionNotice.type === 'error' ? 'alert' : 'status'"
    >
      <p>{{ completionNotice.message }}</p>
      <button
        class="shrink-0 cursor-pointer border-0 bg-transparent p-0 text-current"
        type="button"
        aria-label="Dismiss deploy notification"
        @click="dismissCompletionNotice"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>

    <div
      v-if="summary && !summary.hasBuildHook"
      class="border border-house-warning/40 bg-house-warning-surface p-3 text-sm font-semibold text-house-warning"
      role="status"
    >
      Add <code>NETLIFY_BUILD_HOOK_URL</code> to enable manual builds.
    </div>

    <div v-if="visibleDeploy" class="grid gap-3">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-sm font-bold text-house-text">
            Latest deploy: {{ visibleDeploy.label }}
          </p>
          <p class="mt-1 text-xs text-house-text-muted">
            {{ visibleDeploy.branch || visibleDeploy.context || 'main' }} ·
            {{ formatDate(visibleDeploy.createdAt) }} ·
            Ref {{ formatBuildReference(visibleDeploy) }}
          </p>
        </div>
      </div>

      <div
        class="h-3 overflow-hidden rounded-full bg-house-surface-muted"
        role="progressbar"
        :aria-label="`Netlify deploy progress: ${visibleDeploy.label}`"
        :aria-valuenow="visibleDeploy.progress"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          class="h-full transition-all"
          :class="[
            deployProgressClass,
            isVisibleDeployActive ? 'netlify-deploy-progress-active' : ''
          ]"
          :style="{ width: `${visibleDeploy.progress}%` }"
        />
      </div>

      <p
        v-if="visibleDeploy.errorMessage && !completionNotice"
        class="border border-house-error/40 bg-house-error-surface p-3 text-sm font-semibold text-house-error"
        role="alert"
      >
        {{ visibleDeploy.errorMessage }}
      </p>
    </div>

    <div
      v-else-if="isLoading"
      class="border border-house-border bg-house-surface-muted p-3 text-sm text-house-text-muted"
    >
      Loading Netlify deploy status...
    </div>

    <div
      v-else-if="summary && !summary.hasAuthToken"
      class="border border-house-border bg-house-surface-muted p-3 text-sm text-house-text-muted"
    >
      Add <code>NETLIFY_AUTH_TOKEN</code> to show deploy progress, history, and stats.
    </div>

    <dl v-if="summary?.stats" class="grid gap-3 text-sm sm:grid-cols-4">
      <div class="border border-house-border p-3">
        <dt class="text-house-text-muted">Latest live deploy</dt>
        <dd class="mt-1 font-semibold text-house-text">
          {{ formatDate(summary.stats.latestPublishedAt) }}
        </dd>
      </div>
      <div class="border border-house-border p-3">
        <dt class="text-house-text-muted">Recent success</dt>
        <dd class="mt-1 font-semibold text-house-text">
          {{ summary.stats.successfulCount }} / {{ summary.stats.recentCount }}
        </dd>
      </div>
      <div class="border border-house-border p-3">
        <dt class="text-house-text-muted">Recent failed</dt>
        <dd class="mt-1 font-semibold text-house-text">
          {{ summary.stats.failedCount }}
        </dd>
      </div>
      <div class="border border-house-border p-3">
        <dt class="text-house-text-muted">Average deploy</dt>
        <dd class="mt-1 font-semibold text-house-text">
          {{ formatDuration(summary.stats.averageDeploySeconds) }}
        </dd>
      </div>
    </dl>

    <div v-if="summary?.deploys.length" class="overflow-x-auto">
      <table class="w-full border-collapse text-left text-sm">
        <caption class="sr-only">
          Recent main branch Netlify deploys
        </caption>
        <thead class="border-b border-house-border text-xs uppercase text-house-text-muted">
          <tr>
            <th class="py-2 pe-4 font-bold" scope="col">Status</th>
            <th class="py-2 pe-4 font-bold" scope="col">Branch</th>
            <th class="py-2 pe-4 font-bold" scope="col">Created</th>
            <th class="py-2 pe-4 font-bold" scope="col">Duration</th>
            <th class="py-2 pe-4 font-bold" scope="col">Build reference</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-house-border">
          <tr v-for="deploy in summary.deploys" :key="deploy.id">
            <td class="py-3 pe-4 font-semibold text-house-text">
              {{ deploy.label }}
            </td>
            <td class="py-3 pe-4 text-house-text-muted">
              {{ deploy.branch || deploy.context || 'main' }}
            </td>
            <td class="py-3 pe-4 text-house-text-muted">
              {{ formatDate(deploy.createdAt) }}
            </td>
            <td class="py-3 pe-4 text-house-text-muted">
              {{ formatDuration(deploy.deployTime) }}
            </td>
            <td class="max-w-xs py-3 pe-4 text-house-text-muted">
              <span class="font-mono">{{ formatBuildReference(deploy) }}</span>
              <span v-if="deploy.commitMessage" class="mt-1 block line-clamp-2">
                {{ deploy.commitMessage }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
