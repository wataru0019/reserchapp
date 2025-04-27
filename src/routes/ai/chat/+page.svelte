<script lang="ts">
    import Button from '$lib/components/Button.svelte'

    let { data } = $props();
    type Message = {
        content: string;
        isAI: boolean;
    }

    // 初期メッセージは空の配列に変更
    let messages: Message[] = $state([]);
    let query = $state('');
    let loading = $state(false);
    let thread_id = $state('');

    async function handleSubmit() {
        console.log(thread_id)
        if (query.trim()) {
            // ユーザーのメッセージを追加
            messages = [...messages, { content: query, isAI: false }];

            // ローディング状態のメッセージを追加
            loading = true;
            messages = [...messages, { content: '...', isAI: true}]
            
            // ここにAIの応答を追加するロジックを入れる場合
            try{
                const response = await postQuery()
                messages = messages.slice(0, -1)
                messages = [...messages, { content: response.content, isAI: response.isAI }]
            } finally {
                loading = false;
                query = ''
            }
        }
    }

    async function postQuery() {
        const response = await fetch('/ai/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: query, thread_id: thread_id })
        })
        const result = await response.json()
        // messages = result.data;
        return result.data
    }

    async function getMessages(_thread_id: string) {
        thread_id = _thread_id
        const response = await fetch(`/ai/chat?thread_id=${thread_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        const result = await response.json()
        messages = result.messages
    }
    
    // メッセージが空かどうかを確認する関数
    const isInitialState = () => messages.length === 0;
</script>

<div class="container mx-auto w-full flex" style="background-color: #F0F4F9;">
    <aside style="height: calc(100vh - 4rem);" class="w-64 bg-primary-200 border-r border-gray-200 shadow-md p-4 overflow-y-auto">
        <h2 class="text-lg font-bold mb-4" style="color: #303964;">スレッド</h2>
        <ul>
            {#each data.threads as thread}
                <li class="mb-2">
                    <a
                        href="#"
                        class="block p-2 bg-primary-200 border border-gray-200 rounded-md hover:bg-gray-100"
                        style=" transition: all 0.2s ease;"
                        on:click={() => getMessages(thread)}
                    >
                        <span class="text-sm font-inter" style="color: #000000;">{thread}</span>
                    </a>
                </li>
            {/each}
        </ul>
    </aside>

    <div class="flex-1 p-4 flex flex-col" style="height: calc(100vh - 4rem); background-color: #F0F4F9;">
        {#if isInitialState()}
            <!-- 初期状態: 入力フォームを中央に配置 -->
            <div class="flex-1 flex items-center justify-center p-4">
                <div class="w-full max-w-lg">
                    <h1 class="text-2xl font-bold text-center mb-6" style="color: #303964;">AIアシスタント</h1>
                    <p class="text-center mb-8 text-gray-600">質問や調べたいことを入力してください</p>
                    
                    <div class="flex items-center gap-2">
                        <input 
                            type="text"
                            bind:value={query}
                            name="query"
                            placeholder="今日は何を調べますか？"
                            class="h-12 text-base font-inter rounded-lg focus:outline-none block w-full p-3"
                            style="background-color: #D9E2ED; color: rgba(0, 0, 0, 0.5);"
                            on:keydown={(e) => e.key === 'Enter' && handleSubmit()}
                        />
                        <button 
                            class="rounded-full flex items-center justify-center w-12 h-12"
                            style="background-color: #303964; color: #FFFFFF;"
                            on:click={handleSubmit}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        {:else}
            <!-- チャット状態: 通常のチャットUI -->
            <div class="flex-1 overflow-y-auto p-4 space-y-4 shadow-inner" style="background-color: #F0F4F9;">
                {#each messages as message}
                    <div class="flex {message.isAI ? 'justify-start' : 'justify-end'}">
                        <div class="rounded-lg px-4 py-2 max-w-[80%] font-inter text-base {loading && message.content === '...' ? 'animate-pulse' : ''}"
                             style="background-color: {message.isAI ? '#4A5B96' : '#E6E7E9'}; color: {message.isAI ? '#FFFFFF' : '#000000'}; white-space: pre-wrap;">
                            {message.content}
                        </div>
                    </div>
                {/each}
            </div>

            <div class="p-4 border-t border-gray-200" style="background-color: #FFFFFF;">
                <div class="flex items-center gap-2">
                    <input 
                        type="text"
                        bind:value={query}
                        name="query"
                        placeholder="今日は何を調べますか？"
                        class="h-12 text-base font-inter rounded-lg focus:outline-none block w-full p-3"
                        style="background-color: #D9E2ED; color: rgba(0, 0, 0, 0.5);"
                        on:keydown={(e) => e.key === 'Enter' && handleSubmit()}
                    />
                    <button 
                        class="rounded-full flex items-center justify-center w-12 h-12"
                        style="background-color: #303964; color: #FFFFFF;"
                        on:click={handleSubmit}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
    
    :global(body) {
        font-family: 'Inter', sans-serif;
    }
    
    .font-inter {
        font-family: 'Inter', sans-serif;
    }
</style>