// Servicios iniciales del catálogo: se insertan solo si la tabla services está vacía.
// Después, el catálogo se administra desde el panel de administrador.
export const SEED_SERVICES = [
  {
    id: 'lavado-premium',
    name: 'Lavado Premium',
    category: 'detailing',
    description:
      'Prelavado con foam, lavado a mano con shampoo pH neutro, desengrase de cadena y rines, secado con aire y abrillantado rápido.',
    priceFrom: 45000,
    durationMin: 60,
    cilindraje: 'todas',
    active: true,
  },
  {
    id: 'detailing-completo',
    name: 'Detailing Completo',
    category: 'detailing',
    description:
      'Limpieza profunda pieza por pieza, descontaminado de pintura, encerado, restauración de plásticos y tratamiento de llantas.',
    priceFrom: 120000,
    durationMin: 180,
    cilindraje: 'todas',
    active: true,
  },
  {
    id: 'pulido-correccion',
    name: 'Pulido y Corrección de Pintura',
    category: 'detailing',
    description:
      'Eliminación de rayones superficiales, swirls y opacidad con pulidora orbital y compuestos de corte. Brillo de exhibición.',
    priceFrom: 180000,
    durationMin: 240,
    cilindraje: 'todas',
    active: true,
  },
  {
    id: 'ceramico',
    name: 'Recubrimiento Cerámico',
    category: 'detailing',
    description:
      'Protección cerámica de larga duración para pintura, cromados y rines. Repele agua, polvo y rayos UV hasta por 2 años.',
    priceFrom: 350000,
    durationMin: 300,
    cilindraje: 'todas',
    active: true,
  },
  {
    id: 'mantenimiento-bajo',
    name: 'Mantenimiento Preventivo (bajo cilindraje)',
    category: 'mecanica',
    description:
      'Para motos hasta 250cc: cambio de aceite y filtro, ajuste de frenos, tensión de cadena, revisión eléctrica y de luces.',
    priceFrom: 90000,
    durationMin: 120,
    cilindraje: 'bajo',
    active: true,
  },
  {
    id: 'mantenimiento-alto',
    name: 'Mantenimiento Preventivo (alto cilindraje)',
    category: 'mecanica',
    description:
      'Para motos desde 300cc: aceite sintético, filtros, bujías, refrigerante, revisión de suspensión y escaneo electrónico.',
    priceFrom: 220000,
    durationMin: 180,
    cilindraje: 'alto',
    active: true,
  },
  {
    id: 'kit-arrastre',
    name: 'Cambio de Kit de Arrastre',
    category: 'mecanica',
    description:
      'Instalación de cadena, piñón y corona con alineación y lubricación. El valor corresponde a mano de obra.',
    priceFrom: 60000,
    durationMin: 90,
    cilindraje: 'todas',
    active: true,
  },
  {
    id: 'frenos',
    name: 'Servicio de Frenos',
    category: 'mecanica',
    description:
      'Cambio de pastillas, purga y cambio de líquido de frenos, revisión de discos y calipers. Compatible con ABS.',
    priceFrom: 70000,
    durationMin: 90,
    cilindraje: 'todas',
    active: true,
  },
  {
    id: 'diagnostico',
    name: 'Diagnóstico Electrónico',
    category: 'mecanica',
    description:
      'Escaneo computarizado de la ECU, lectura de códigos de falla, revisión de sensores e inyección.',
    priceFrom: 80000,
    durationMin: 60,
    cilindraje: 'todas',
    active: true,
  },
]
