<script lang="ts">
    let linkHome = '/news';
    let linkLogin = '/users/login';
    let linkSignin = '/users/signin';
    let linkProfile = '/users/profile';
</script>

<header class="bg-primary-800 text-white py-4 font-sans">
    <div class="container mx-auto px-8 flex justify-between items-center">
        <a class="text-2xl font-bold" href={linkHome}>News Resercher</a>
        <nav>
            <ul class="flex space-x-6">
                <li class="cursor-pointer hover:text-orange-400 transition-colors duration-300"><a href={linkLogin}>ログイン</a></li>
                <li class="cursor-pointer hover:text-orange-400 transition-colors duration-300"><a href={linkSignin}>新規登録</a></li>
                <li class="cursor-pointer hover:text-orange-400 transition-colors duration-300"><a href={linkProfile}>Profile</a></li>
            </ul>
        </nav>
    </div>
</header>

<style>

</style>