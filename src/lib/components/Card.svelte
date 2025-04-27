<script lang="ts">
    let { title, link } = $props()
</script>

<div class="card min-w-0 break-words">
    <div class="card-title">
        <h3>{title}</h3>
    </div>
    <div class="card-link">
        <a href={link}>{link}</a>
    </div>
</div>

<style></style>