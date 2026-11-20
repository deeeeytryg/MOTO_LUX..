<script setup lang="ts">
import TheHeader from '@/components/TheHeader.vue'
import TheFooter from '@/components/TheFooter.vue'
import HeroSection from '@/components/home/HeroSection.vue'
import ServicesSection from '@/components/home/ServicesSection.vue'
import ProcessSection from '@/components/home/ProcessSection.vue'
import ContactSection from '@/components/home/ContactSection.vue'
</script>

<template>
  <TheHeader />
  <main>
    <HeroSection />
    <ServicesSection />
    <ProcessSection />
    <ContactSection />
  </main>
  <TheFooter />
</template>
