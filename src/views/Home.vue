<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import SocialMedia from '@/components/SocialMedia.vue'
import Credential from '@/components/Credential.vue'
import Projects from '@/components/Projects.vue'
import Overview from '@/components/Overview.vue'
import Contact from '@/components/Contact.vue'
import Introduction from '@/components/Introduction.vue'

const isScrolled = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (!element) return

  const headerOffset = 80
  const elementPosition = element.getBoundingClientRect().top
  const offsetPosition = elementPosition + window.pageYOffset - headerOffset

  window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="landing">
    <div class="flex flex-col bg-[#050f07]">
      <!-- Header -->
      <div class="sticky top-0 z-50 transition-all duration-300 text-center text-white">
        <div class="flex items-center py-2 justify-center">
          <nav
            :class="
              isScrolled
                ? 'max-w-[calc(100vw-1rem)] overflow-x-auto px-3 sm:px-6 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-lg transition-all duration-300'
                : 'flex border-0/0 border-transparent transition-all duration-300'
            "
          >
            <ul
              class="flex gap-4 sm:gap-8 p-3 sm:p-4 justify-center whitespace-nowrap text-sm sm:text-base"
            >
              <li
                class="cursor-pointer hover:text-primary-400 transition"
                @click="scrollToSection('about')"
              >
                About
              </li>
              <li
                class="cursor-pointer hover:text-primary-400 transition"
                @click="scrollToSection('stacks')"
              >
                Stacks
              </li>
              <li
                class="cursor-pointer hover:text-primary-400 transition"
                @click="scrollToSection('projects')"
              >
                Projects
              </li>
              <li
                class="cursor-pointer hover:text-primary-400 transition"
                @click="scrollToSection('contact')"
              >
                Contact
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <Introduction />
      <Overview />
      <Projects />
      <Credential />
      <Contact />
      <SocialMedia />

      <!-- Footer -->
      <!-- <footer class="bg-gray-800 text-white text-center py-5">
      <p>© 2024 hokya.dev. All rights reserved.</p>
    </footer> -->
    </div>
  </div>
</template>

<style scoped></style>
