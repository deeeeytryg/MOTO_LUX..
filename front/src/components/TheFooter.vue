<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Clock, MessageCircle, Phone } from 'lucide-vue-next'
import { BUSINESS } from '@/business'
import { img } from '@/lib/format'
import { scrollToSection } from '@/lib/scroll'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="bg-ink text-ink-foreground">
    <div class="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-2 md:px-6">
      <div class="flex items-center gap-4">
        <img :src="img('logo-full.webp')" alt="Logo de MotoLux" class="size-16 rounded-full object-cover ring-2 ring-gold/50" />
        <div>
          <p class="font-display text-2xl font-semibold tracking-wide">MOTO<span class="text-gold">LUX</span></p>
          <p class="text-sm text-ink-foreground/60">Detailing · Premium Care · Mecánica</p>
        </div>
      </div>
      <ul class="grid gap-2 text-sm text-ink-foreground/80">
        <li class="flex items-center gap-2"><Phone class="size-4 text-gold" aria-hidden="true" />{{ BUSINESS.phone }}</li>
        <li class="flex items-center gap-2"><Clock class="size-4 text-gold" aria-hidden="true" />{{ BUSINESS.hours }}</li>
        <li class="flex items-center gap-2">
          <MessageCircle class="size-4 text-gold" aria-hidden="true" />
          <a :href="`https://wa.me/${BUSINESS.whatsapp}`" target="_blank" rel="noopener noreferrer" class="hover:text-gold">
            Escríbenos por WhatsApp
          </a>
        </li>
      </ul>
      <nav aria-label="Pie de página" class="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-foreground/70 md:col-span-2">
        <a href="#servicios" class="hover:text-gold" @click.prevent="scrollToSection('servicios')">Servicios</a>
        <a href="#contacto" class="hover:text-gold" @click.prevent="scrollToSection('contacto')">Contacto</a>
        <a :href="BUSINESS.instagram" target="_blank" rel="noopener noreferrer" class="hover:text-gold">Instagram</a>
        <RouterLink to="/admin" class="hover:text-gold">Panel administrativo</RouterLink>
      </nav>
    </div>
    <div class="border-t border-white/10 py-5 text-center text-xs text-ink-foreground/50">
      © {{ year }} MotoLux. Todos los derechos reservados.
    </div>
  </footer>
</template>
