<script>
    import Button from "$lib/components/Button.svelte";
    import Card from "$lib/components/Card.svelte";
    import add from "$lib/service/logic.js"
    let title = "test"
    let count = $state(0)
    let { data } = $props()

    function incrementCount() {
        count++
        count = add(count)
    }
</script>

<div class="container grid grid-cols-4 mx-auto w-full max-w-md">
    <h1 class="col-span-full flex justify-center">News</h1>
    {#each data.posts as {title, description}}
        <Card 
            title={title}
            descriptin={description}
        />
    {/each}
    <p>{count}</p>
    <Button
        word="カウントを増やす"
        gridClass="col-span-full"
        on:click={incrementCount}
        />
</div>

<style>

</style>