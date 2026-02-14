<template>
  <section id="stacks" class="py-8 flex flex-col bg-[#050f07] justify-center">
    <div class="text-center">
      <h2 class="tracking-widest font-bold my-4 text-white text-xl">STACK</h2>
    </div>
    <div class="px-4 lg:px-24 flex flex-col lg:flex-row w-full">
      <div class="flex gap-4 items-center justify-center flex-wrap w-full lg:max-w-[35%] p-12">
        <div
          class="w-16 h-16 bg-[#141516] rounded-md flex items-center justify-center hover:bg-accent-800 transition-all group"
        >
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg"
            alt="Django"
            class="w-10 h-10 grayscale group-hover:grayscale-0 transition-all"
          />
        </div>
        <div
          class="w-24 h-24 bg-[#141516] rounded-md flex items-center justify-center hover:bg-accent-800 transition-all group"
        >
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg"
            alt="Next.js"
            class="w-14 h-14 grayscale group-hover:grayscale-0 transition-all"
          />
        </div>
        <div
          class="w-20 h-20 bg-[#141516] rounded-md flex items-center justify-center hover:bg-accent-800 transition-all group"
        >
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg"
            alt="Docker"
            class="w-12 h-12 grayscale group-hover:grayscale-0 transition-all"
          />
        </div>
        <div
          class="w-14 h-14 bg-[#141516] rounded-md flex items-center justify-center hover:bg-accent-800 transition-all group"
        >
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rabbitmq/rabbitmq-original.svg"
            alt="RabbitMQ"
            class="w-8 h-8 grayscale group-hover:grayscale-0 transition-all"
          />
        </div>
        <div
          class="w-28 h-28 bg-[#141516] rounded-md flex items-center justify-center hover:bg-accent-800 transition-all group"
        >
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg"
            alt="React"
            class="w-16 h-16 grayscale group-hover:grayscale-0 transition-all"
          />
        </div>
        <div
          class="w-18 h-18 bg-[#141516] rounded-md flex items-center justify-center hover:bg-accent-800 transition-all group"
        >
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg"
            alt="Vue"
            class="w-10 h-10 grayscale group-hover:grayscale-0 transition-all"
          />
        </div>
        <div
          class="w-22 h-22 bg-[#141516] rounded-md flex items-center justify-center hover:bg-accent-800 transition-all group"
        >
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg"
            alt="Go"
            class="w-12 h-12 grayscale group-hover:grayscale-0 transition-all"
          />
        </div>
        <div
          class="w-16 h-16 bg-[#141516] rounded-md flex items-center justify-center hover:bg-accent-800 transition-all group"
        >
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg"
            alt="JavaScript"
            class="w-10 h-10 grayscale group-hover:grayscale-0 transition-all"
          />
        </div>
        <div
          class="w-24 h-24 bg-[#141516] rounded-md flex items-center justify-center hover:bg-accent-800 transition-all group"
        >
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg"
            alt="Python"
            class="w-14 h-14 grayscale group-hover:grayscale-0 transition-all"
          />
        </div>
        <div
          class="w-12 h-12 bg-[#141516] rounded-md flex items-center justify-center hover:bg-accent-800 transition-all group"
        >
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg"
            alt="Laravel"
            class="w-8 h-8 grayscale group-hover:grayscale-0 transition-all"
          />
        </div>
        <div
          class="w-20 h-20 bg-[#141516] rounded-md flex items-center justify-center hover:bg-accent-800 transition-all group"
        >
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg"
            alt="GCP"
            class="w-12 h-12 grayscale group-hover:grayscale-0 transition-all"
          />
        </div>
      </div>

      <div class="flex flex-col gap-4 justify-center px-[5%] w-full lg:w-1/2">
        <div class="flex flex-row gap-2 w-full">
          <Tooltip content="Foundation">
            <Highlighter class="w-13.25 h-13.25">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="currentColor"
              >
                <path
                  d="M80-220v-360q0-25 17.5-42.5T140-640h60v-100q0-25 17.5-42.5T260-800h120q25 0 42.5 17.5T440-740v100h80v-100q0-25 17.5-42.5T580-800h120q25 0 42.5 17.5T760-740v100h60q25 0 42.5 17.5T880-580v360q0 25-17.5 42.5T820-160H140q-25 0-42.5-17.5T80-220Z"
                />
              </svg>
            </Highlighter>
          </Tooltip>
          <!-- <Highlighter class="w-full">Javascript, Golang, PHP, Python </Highlighter> -->
          <Highlighter class="px-4">Javascript</Highlighter>
          <Highlighter class="px-4">Golang</Highlighter>
          <Highlighter class="px-4">PHP</Highlighter>
          <Highlighter class="px-4">Python</Highlighter>
        </div>
        <div class="flex flex-row gap-2 w-full">
          <Tooltip content="Front-End">
            <Highlighter class="w-13.25 h-13.25">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="currentColor"
              >
                <path
                  d="M40-200v-360q0-17 11.5-28.5T80-600q17 0 28.5 11.5T120-560v40h80v-280q0-17 11.5-28.5T240-840q17 0 28.5 11.5T280-800v40h80v-40q0-17 11.5-28.5T400-840q17 0 28.5 11.5T440-800v40h80v-40q0-17 11.5-28.5T560-840q17 0 28.5 11.5T600-800v40h80v-40q0-17 11.5-28.5T720-840q17 0 28.5 11.5T760-800v280h80v-40q0-17 11.5-28.5T880-600q17 0 28.5 11.5T920-560v360q0 33-23.5 56.5T840-120H600q-17 0-28.5-11.5T560-160v-80q0-33-23.5-56.5T480-320q-33 0-56.5 23.5T400-240v80q0 17-11.5 28.5T360-120H120q-33 0-56.5-23.5T40-200Zm330-280h60q5 0 7.5-2.5t2.5-7.5v-70q0-17-11.5-28.5T400-600q-17 0-28.5 11.5T360-560v70q0 5 2.5 7.5t7.5 2.5Zm160 0h60q5 0 7.5-2.5t2.5-7.5v-70q0-17-11.5-28.5T560-600q-17 0-28.5 11.5T520-560v70q0 5 2.5 7.5t7.5 2.5Z"
                />
              </svg>
            </Highlighter>
          </Tooltip>
          <!-- <Highlighter class="w-full">React, Vue, Next.js, Tanstask</Highlighter> -->
          <Highlighter class="px-4">React</Highlighter>
          <Highlighter class="px-4">Vue</Highlighter>
          <Highlighter class="px-4">Next.js</Highlighter>
          <Highlighter class="px-4">Tanstack</Highlighter>
        </div>
        <div class="flex flex-row gap-2 w-full">
          <Tooltip content="Back-End">
            <Highlighter class="w-13.25 h-13.25">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="currentColor"
              >
                <path
                  d="M480-164q97-30 162-118.5T718-480H480v-315l-240 90v207q0 7 2 18h238v316Zm0 80q-7 0-13-1t-12-3q-135-45-215-166.5T160-516v-189q0-25 14.5-45t37.5-29l240-90q14-5 28-5t28 5l240 90q23 9 37.5 29t14.5 45v189q0 140-80 261.5T505-88q-6 2-12 3t-13 1Z"
                />
              </svg>
            </Highlighter>
          </Tooltip>
          <!-- <Highlighter class="w-full">Express, Golang, Laravel, Django</Highlighter> -->
          <Highlighter class="px-4">Express</Highlighter>
          <Highlighter class="px-4">Fiber</Highlighter>
          <Highlighter class="px-4">Laravel</Highlighter>
          <Highlighter class="px-4">Django</Highlighter>
        </div>
        <div class="flex flex-row gap-2 w-full">
          <Tooltip content="Infrastructure">
            <Highlighter class="w-13.25 h-13.25">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="currentColor"
              >
                <path
                  d="M219-120q-25 0-42.5-17.5T159-180q0-25 17.5-42.5T219-240h64L181-574q-27-15-44.5-44T119-680q0-50 35-85t85-35q39 0 69.5 22.5T351-720h128v-40q0-17 11.5-28.5T519-800q9 0 17.5 4t14.5 12l68-64q9-9 21.5-11.5T665-856l156 72q12 6 16.5 17.5T837-744q-6 12-17.5 15.5T797-730l-144-66-94 88v56l94 86 144-66q11-5 23-1t17 15q6 12 1 23t-17 17l-156 74q-12 6-24.5 3.5T619-512l-68-64q-6 6-14.5 11t-17.5 5q-17 0-28.5-11.5T479-600v-40H351q-3 8-6.5 15t-9.5 15l200 370h84q25 0 42.5 17.5T679-180q0 25-17.5 42.5T619-120H219Zm20-520q17 0 28.5-11.5T279-680q0-17-11.5-28.5T239-720q-17 0-28.5 11.5T199-680q0 17 11.5 28.5T239-640Z"
                />
              </svg>
            </Highlighter>
          </Tooltip>
          <!-- <Highlighter class="w-full">Docker, RabbitMQ, GCP</Highlighter> -->
          <Highlighter class="px-4">Docker</Highlighter>
          <Highlighter class="px-4">RabbitMQ</Highlighter>
          <Highlighter class="px-4">GCP</Highlighter>
          <Highlighter class="px-4">Sentry</Highlighter>
        </div>
        <div class="flex flex-row gap-2 w-full">
          <Tooltip content="Database">
            <Highlighter class="w-13.25 h-13.25">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="currentColor"
              >
                <path
                  d="M735-567q105-47 105-113T735-793q-105-47-255-47t-255 47q-105 47-105 113t105 113q105 47 255 47t255-47ZM582.5-428.5Q644-437 701-456t98-49.5q41-30.5 41-74.5v100q0 44-41 74.5T701-356q-57 19-118.5 27.5T480-320q-41 0-102.5-8.5T259-356q-57-19-98-49.5T120-480v-100q0 44 41 74.5t98 49.5q57 19 118.5 27.5T480-420q41 0 102.5-8.5Zm0 200Q644-237 701-256t98-49.5q41-30.5 41-74.5v100q0 44-41 74.5T701-156q-57 19-118.5 27.5T480-120q-41 0-102.5-8.5T259-156q-57-19-98-49.5T120-280v-100q0 44 41 74.5t98 49.5q57 19 118.5 27.5T480-220q41 0 102.5-8.5Z"
                />
              </svg>
            </Highlighter>
          </Tooltip>
          <!-- <Highlighter class="w-full">Docker, RabbitMQ, GCP</Highlighter> -->
          <Highlighter class="px-4">PostgreSQL</Highlighter>
          <Highlighter class="px-4">Sqlite</Highlighter>
          <Highlighter class="px-4">Redis</Highlighter>
          <Highlighter class="px-4">Monggo</Highlighter>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import Highlighter from '@/components/Highlighter.vue'
import Tooltip from '@/components/tooltip/Tooltip.vue'
</script>
