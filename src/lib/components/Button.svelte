<script lang="ts">
    let { word, gridClass='', size='' } = $props()
</script>

<button
    class={`bg-primary-600 text-sm rounded-lg p-2 m-4 w-${size} hover:bg-primary-700 text-white text-center ${gridClass}`}
    on:click
    >{ word }
</button>

<style>

</style>