export const script = `<script lang="ts">
  import Flexbox from '$lib/components/Flexbox/Flexbox.svelte';
  import Box from '../lib/components/Box/Box.svelte';
  let color = $state('aqua');
  let computedHeight = $state(200);
  let computedWidth = $derived(color === 'aqua' ? 200 : 100);
  let asdf = 'background-color: green;';
  let cs = { backgroundColor: 'purple' };
</script>`;

export const style = `<style>
div {
  background-color: red;  
}
p {
  color: green;  
}
</style>`;

export const colors = {
  "neutral": {
    "100": "#ffffff",
  },
};

export const options = {
  elementNames: ["Flexbox", "Box", "ScopedStyles"],
  attributeName: "cs",
};
