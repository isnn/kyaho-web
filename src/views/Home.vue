<script>
import SocialMedia from '@/components/SocialMedia.vue'
import Credential from '@/components/Credential.vue'
import Projects from '@/components/Projects.vue'
import Overview from '@/components/Overview.vue'
import Contact from '@/components/Contact.vue'
import DotWorldMap from '@/components/animate/DotWorldMap.vue'

export default {
  name: 'Home',
  components: {
    SocialMedia,
    Credential,
    Projects,
    Overview,
    Contact,
    DotWorldMap,
  },
  data() {
    return {
      isScrolled: false,
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll)
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    handleGetStarted() {
      this.$router.push('/signup')
    },
    handleScroll() {
      this.isScrolled = window.scrollY > 10
    },
    scrollToSection(sectionId) {
      const element = document.getElementById(sectionId)
      if (element) {
        const headerOffset = 80
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        })
      }
    },
  },
}
</script>

<template>
  <div class="landing">
    <div class="flex flex-col bg-[#050f07]">
      <!-- Header -->
      <div class="sticky top-0 z-10 transition-all duration-300 text-center text-white">
        <div class="flex items-center py-2 justify-center">
          <nav
            :class="
              isScrolled
                ? 'px-8 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-lg transition-all duration-300'
                : 'flex border-0/0 border-transparent transition-all duration-300'
            "
          >
            <ul class="flex space-x-8 p-4 justify-center">
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
      <!-- Intro -->
      <!-- <section
        id="about"
        class="bg-[#050f07] text-white flex justify-between items-center h-[calc(100vh-4rem)] px-8"
      >
        <div class="text-left ml-24">
          <h1 class="text-6xl font-bold mb-5">Hi, I am</h1>
          <h1 class="text-6xl font-bold mb-5">Isnan Firmansyah</h1>
          <p class="text-2xl mb-8">Fullstack Engineer</p>
          <p class="text-2xl mb-8">Let’s turn your dream idea into reality</p>
          <button
            class="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-8 py-3 italic hover:opacity-90 transition rounded-3xl"
          >
            Get Started
          </button>
        </div>

        <div class="w-full lg:h-full">
          <DotWorldMap />
        </div>
      </section> -->

      <section
        id="about"
        class="bg-[#050f07] text-white flex flex-col lg:flex-row items-center  h-[calc(100vh-4rem)] px-8"
      >
        <div class="w-full ml-[30%] lg:h-screen">
          <DotWorldMap />
        </div>
        <div class="absolute bg-[linear-gradient(to_right,_rgba(5,15,7,0.98)_80%,_rgba(5,15,7,0.1)_100%)] to-transparent w-1/2 h-full flex items-center">
          <div class="lg:w-1/2 text-left px-8 lg:pl-24 lg:pr-8 py-12">
            <h1 class="text-6xl font-bold mb-5">Hi, I am</h1>
            <h1 class="text-6xl font-bold mb-5">Isnan Firmansyah</h1>
            <p class="text-2xl mb-8">Fullstack Engineer</p>
            <p class="text-2xl mb-8">Let's turn your dream idea into reality</p>
            <button
              class="bg-linear-to-r from-primary-500 to-accent-500 text-white px-8 py-3 italic hover:opacity-90 transition rounded-3xl"
            >
              Get Started
            </button>
          </div>
        </div>
      </section>

      <Overview />
      <Projects id="projects" />
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
