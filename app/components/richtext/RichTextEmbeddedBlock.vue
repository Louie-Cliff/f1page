<script setup lang="ts">
import InstanceRichtextButtons from '~/components/richtext/InstanceRichtextButtons.vue'
import InstanceRichtextEmbed from '~/components/richtext/InstanceRichtextEmbed.vue'
import InstanceRichtextGame from '~/components/richtext/InstanceRichtextGame.vue'
import InstanceRichtextImage from '~/components/richtext/InstanceRichtextImage.vue'
import InstanceRichtextUnknown from '~/components/richtext/InstanceRichtextUnknown.vue'
import InstanceRichtextVideo from '~/components/richtext/InstanceRichtextVideo.vue'
import type { NormalizedRichTextEmbeddedBlock } from '~/types/content'

const props = defineProps<{
  block: NormalizedRichTextEmbeddedBlock
}>()

const componentMap = {
  instance_richtext_buttons: InstanceRichtextButtons,
  instance_richtext_embed: InstanceRichtextEmbed,
  instance_richtext_game: InstanceRichtextGame,
  instance_richtext_image: InstanceRichtextImage,
  instance_richtext_video: InstanceRichtextVideo
}

const resolvedComponent = computed(
  () =>
    componentMap[props.block.component as keyof typeof componentMap] ||
    InstanceRichtextUnknown
)
</script>

<template>
  <component :is="resolvedComponent" :blok="block.blok" />
</template>
