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

<div class="container grid grid-cols-3 gap-x-4 gap-y-6 mx-auto w-full max-w-[800px] min-w-0 overflow-x-hidden">
    <h1 class="col-span-full flex justify-center">News</h1>
    {#each data.posts as {title, link}}
        <Card 
            title={title}
            link={link}
        />
    {/each}
    <p class="col-span-full">{count}</p>
    <Button
        word="カウントを増やす"
        gridClass="col-span-full"
        on:click={incrementCount}
        />
</div>

<style>
/* 必要ならここに追加のスタイルを */
</style>