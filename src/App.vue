
<template>
  <div id="app">
    <nav class="h-12  bg-gray-800 text-white flex items-center">
      <router-link to="/">Login</router-link> |
      <router-link to="/members">Members</router-link> |
      <router-link to="/products">Products</router-link>
    </nav>
    <router-view/>
  </div>
</template>