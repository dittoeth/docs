<script setup lang="ts">
export interface Props {
  name: string;
  avatar: string;
  twitter: string;
}

withDefaults(defineProps<Props>(), {
  name: "DittoETH",
  avatar: "https://avatars.githubusercontent.com/u/136378658?v=4",
  twitter: "dittoproj",
});
</script>

<template>
  <a
    :href="`https://twitter.com/${twitter}`"
    target="_blank"
    rel="noopener noreferrer"
  >
    <img :src="avatar" alt="author image" />
    @{{ twitter }}
  </a>
</template>

<style scoped>
a {
  display: flex;
  align-items: center;
  margin-top: 8px;
  color: inherit;
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}
img {
  border-radius: 9999px;
  width: 2.5rem;
  height: 2.5rem;
  margin-right: 6px;
}
</style>
