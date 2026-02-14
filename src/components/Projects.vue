<script setup>
import ProjectCard from './card/ProjectCard.vue'

defineOptions({
  name: 'Projects',
})
</script>

<template>
  <section
    id="projects"
    class="bg-[#050f07] text-white flex justify-center flex-col items-center pb-16"
  >
    <h2 class="tracking-widest font-bold my-4 text-white text-xl">PROJECTS</h2>

    <div class="flex flex-col gap-20 w-full">
      <ProjectCard
        title="MinerbaOne"
        description="Enterprise-scale platform for the Energy & Mineral Resources sector. Engineered Multi-Layered Security Validation for strict data integrity and Hierarchical Approval Workflows with full audit traceability, accelerating national digital transparency and improving system reliability and development speed by 600%"
        :labels="{
          appType: 'Gov App',
          role: 'Back-End Engineer',
          impactText: '3x Effectiveness',
        }"
        link="/projects/billing-platform"
        :image="'/assets/emone.png'"
        :show-action-button="false"
      >
      </ProjectCard>

      <ProjectCard
        title="Industrial IoT Monitoring Dashboard"
        description="High-performance IoT monitoring platform for national oil & gas sectors. Features real-time mapping and bi-directional hardware control, built on a modular, highly maintainable architecture utilizing Dual-Environment Availability to ensure seamless access across varying network conditions"
        link="/assets/sparc.png"
        :align-text="'right'"
        :labels="{
          appType: 'Dashboard Realtime Monitoring',
          role: 'Project Manager',
          impactText: 'IoT Integration',
        }"
        :image="'/assets/spert.png'"
        :showNdaBadge="true"
        :show-action-button="false"
      >
      </ProjectCard>

      <ProjectCard
        title="Geo-Seismic Analytics Suite"
        description="End-to-end geophysical data platform for seismic interpretation and processing. Supporting industry-standard formats and complex workflows—including Magnetotelluric, Magnetic, Gravity, and Aeromagnetic methods—to enable seamless field acquisition planning, raw data processing, and high-precision visualization"
        :labels="{
          appType: 'Seismics Processing App',
          role: 'Front-End Engineer',
          impactText: 'End to End Processing',
        }"
        link="/projects/billing-platform"
        :image-bg-color="'red'"
        :image="'/assets/mant.png'"
        :showNdaBadge="true"
        :show-action-button="false"
      >
      </ProjectCard>
    </div>
  </section>
</template>
