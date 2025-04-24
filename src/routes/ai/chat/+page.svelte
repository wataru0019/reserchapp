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
        return result.data
    }
    
    // メッセージが空かどうかを確認する関数
    const isInitialState = () => messages.length === 0;
</script>

    <div class="container mx-auto w-full flex">
    <aside style="height: calc(100vh - 16rem);" class="w-64 bg-white border-r border-gray-300 shadow-md p-4 overflow-y-auto">
        <h2 class="text-lg font-bold mb-4">スレッド</h2>
        <ul>
            {#each data.threads as thread}
                <li class="mb-2">
                    <a
                        href="#"
                        class="block p-2 border border-gray-300 rounded-md hover:bg-gray-100"
                        onclick={() => thread_id = thread}
                    >
                        {thread}
                    </a>
                </li>
            {/each}
        </ul>
    </aside>

    <div class="flex-1 p-4 bg-primary-50">
        {#if isInitialState()}
            <!-- 初期状態: 入力フォームを中央に配置 -->
            <div class="flex-1 flex items-center justify-center p-4">
                <div class="w-full max-w-lg">
                    <h1 class="text-2xl font-bold text-center mb-6 text-gray-800">AIアシスタント</h1>
                    <p class="text-center mb-8 text-gray-600">質問や調べたいことを入力してください</p>
                    
                    <div class="flex items-center gap-2">
                        <input 
                            type="text"
                            bind:value={query}
                            name="query"
                            placeholder="今日は何を調べますか？"
                            class="bg-gray-50 h-12 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3"
                            onkeydown={(e) => e.key === 'Enter' && handleSubmit()}
                        />
                        <Button 
                            word="送信"
                            on:click={handleSubmit}
                        />
                    </div>
                </div>
            </div>
        {:else}
            <!-- チャット状態: 通常のチャットUI -->
            <div class="chatarea flex-1 overflow-y-auto p-4 space-y-4 bg-primary-50 shadow-inner">
                {#each messages as message}
                    <div class="flex {message.isAI ? 'justify-start' : 'justify-end'}">
                        <div class="{message.isAI ? 
                            'bg-gray-100 text-gray-800 shadow-sm border border-gray-200' : 
                            'bg-primary-500 text-white shadow-sm'} 
                            rounded-lg px-4 py-2 max-w-[80%] {loading && message.content === '...' ? 'animate-pulse' : ''}">
                            {message.content}
                        </div>
                    </div>
                {/each}
            </div>

            <div class="input-wrapper p-4 border-t border-gray-200 bg-white shadow-lg">
                <div class="flex items-center gap-2">
                    <input 
                        type="text"
                        bind:value={query}
                        name="query"
                        placeholder="今日は何を調べますか？"
                        class="bg-gray-50 h-12 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3"
                        onkeydown={(e) => e.key === 'Enter' && handleSubmit()}
                    />
                    <Button 
                        word="送信"
                        on:click={handleSubmit}
                    />
                </div>
            </div>
        {/if}
    </div>
    </div>

<style></style>