export function getInitialDashboardData() {
    return {
        sales: [
            {
                id: 101,
                date: '2024-08-18T14:05:00Z',
                total: 102000,
                status: 'Completado',
                statusClass: 'success',
                paymentMethod: 'Transferencia',
                client: { name: 'Distribuidora El Roble' },
                items: [
                    {
                        productId: 11,
                        productName: 'Paquete Gourmet Café',
                        quantity: 12,
                        unitPrice: 8500
                    }
                ],
                notes: 'Entrega programada para mañana a primera hora.'
            },
            {
                id: 102,
                date: '2024-08-18T10:32:00Z',
                total: 47600,
                status: 'Pendiente',
                statusClass: 'pending',
                paymentMethod: 'Tarjeta',
                client: { name: 'Tienda La Esquina' },
                items: [
                    {
                        productId: 13,
                        productName: 'Kit de Salsas Premium',
                        quantity: 4,
                        unitPrice: 11900
                    }
                ],
                notes: 'Esperando confirmación de pago.'
            },
            {
                id: 103,
                date: '2024-08-17T17:41:00Z',
                total: 117600,
                status: 'Completado',
                statusClass: 'success',
                paymentMethod: 'Transferencia',
                client: { name: 'Mercado Central' },
                items: [
                    {
                        productId: 14,
                        productName: 'Cesta de Snacks Saludables',
                        quantity: 12,
                        unitPrice: 9800
                    }
                ]
            },
            {
                id: 104,
                date: '2024-08-16T12:15:00Z',
                total: 56700,
                status: 'Cancelado',
                statusClass: 'canceled',
                paymentMethod: 'Efectivo',
                client: { name: 'Mini Súper Lomas' },
                items: [
                    {
                        productId: 17,
                        productName: 'Licores Artesanales',
                        quantity: 3,
                        unitPrice: 18900
                    }
                ],
                notes: 'Pedido cancelado por el cliente.'
            },
            {
                id: 105,
                date: '2024-08-15T09:22:00Z',
                total: 94000,
                status: 'Completado',
                statusClass: 'success',
                paymentMethod: 'Sinpe',
                client: { name: 'Boutique Azul' },
                items: [
                    {
                        productId: 16,
                        productName: 'Vinos de la Casa',
                        quantity: 4,
                        unitPrice: 23500
                    }
                ]
            }
        ],
        clients: [
            {
                id: 1,
                name: 'Distribuidora El Roble',
                email: 'compras@elroble.cr',
                phone: '+506 2250-1122',
                company: 'Distribuidora El Roble',
                status: 'Activo',
                statusClass: 'success',
                notes: 'Cliente mayorista con entregas semanales.'
            },
            {
                id: 2,
                name: 'Tienda La Esquina',
                email: 'contacto@laesquina.cr',
                phone: '+506 2288-7744',
                company: 'Tienda La Esquina',
                status: 'Activo',
                statusClass: 'success',
                notes: 'Prefiere entregas lunes y jueves.'
            },
            {
                id: 3,
                name: 'Mercado Central',
                email: 'compras@mercadocentral.cr',
                phone: '+506 2290-5599',
                company: 'Mercado Central',
                status: 'Prospecto',
                statusClass: 'info',
                notes: 'Pendiente de enviar catálogo actualizado.'
            },
            {
                id: 4,
                name: 'Mini Súper Lomas',
                email: 'ventas@minilomas.cr',
                phone: '+506 2244-7810',
                company: 'Mini Súper Lomas',
                status: 'Inactivo',
                statusClass: 'neutral',
                notes: 'Sin pedidos desde junio, contactar para seguimiento.'
            },
            {
                id: 5,
                name: 'Boutique Azul',
                email: 'compras@boutiqueazul.cr',
                phone: '+506 2277-3335',
                company: 'Boutique Azul',
                status: 'Activo',
                statusClass: 'success',
                notes: 'Solicitó surtido especial para temporada navideña.'
            },
            {
                id: 6,
                name: 'Tecnologías Rivera',
                email: 'administracion@tecrivera.cr',
                phone: '+506 4001-9050',
                company: 'Tecnologías Rivera',
                status: 'Prospecto',
                statusClass: 'info',
                notes: 'Interesados en paquetes corporativos.'
            }
        ],
        products: [
            {
                id: 11,
                portalId: 'catalogo-digital',
                name: 'Paquete Gourmet Café',
                category: 'Bebidas',
                price: 8500,
                stock: 24,
                status: 'Disponible',
                statusClass: 'success',
                image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=200&q=80',
                shortDescription: 'Café premium de tostado medio con notas de chocolate y caramelo.'
            },
            {
                id: 12,
                portalId: 'catalogo-digital',
                name: 'Caja de Tés Artesanales',
                category: 'Bebidas',
                price: 7200,
                stock: 15,
                status: 'Disponible',
                statusClass: 'success',
                image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=200&q=80',
                shortDescription: 'Selección de 6 sabores orgánicos con empaques biodegradables.'
            },
            {
                id: 13,
                portalId: 'catalogo-digital',
                name: 'Kit de Salsas Premium',
                category: 'Gourmet',
                price: 11900,
                stock: 8,
                status: 'Bajo stock',
                statusClass: 'warning',
                image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=200&q=80',
                shortDescription: 'Salsas artesanales sin conservantes añadidos.'
            },
            {
                id: 14,
                portalId: 'catalogo-digital',
                name: 'Cesta de Snacks Saludables',
                category: 'Snacks',
                price: 9800,
                stock: 30,
                status: 'Disponible',
                statusClass: 'success',
                image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=200&q=80',
                shortDescription: 'Paquete con frutos secos, barras energéticas y chips horneados.'
            },
            {
                id: 15,
                portalId: 'catalogo-digital',
                name: 'Selección de Quesos Locales',
                category: 'Lácteos',
                price: 15900,
                stock: 5,
                status: 'Requiere reposición',
                statusClass: 'alert',
                shortDescription: 'Variedad de quesos madurados de productores regionales.'
            },
            {
                id: 16,
                portalId: 'catalogo-digital',
                name: 'Vinos de la Casa',
                category: 'Bebidas',
                price: 23500,
                stock: 12,
                status: 'Disponible',
                statusClass: 'success',
                image: 'https://images.unsplash.com/photo-1510626176961-4b37d0d4ec9c?auto=format&fit=crop&w=200&q=80',
                shortDescription: 'Blend tinto con crianza de 12 meses en barrica francesa.'
            },
            {
                id: 17,
                portalId: 'catalogo-digital',
                name: 'Licores Artesanales',
                category: 'Bebidas',
                price: 18900,
                stock: 0,
                status: 'Agotado',
                statusClass: 'danger',
                shortDescription: 'Recetas familiares infusionadas con especias tropicales.'
            },
            {
                id: 21,
                portalId: 'el-roble',
                name: 'Aceite de Oliva Premium',
                category: 'Abarrotes',
                price: 6200,
                stock: 42,
                status: 'Disponible',
                statusClass: 'success',
                image: 'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=200&q=80',
                shortDescription: 'Aceite extra virgen importado de origen mediterráneo.'
            },
            {
                id: 22,
                portalId: 'el-roble',
                name: 'Paquete de Frutas Deshidratadas',
                category: 'Snacks',
                price: 5400,
                stock: 18,
                status: 'Bajo stock',
                statusClass: 'warning',
                image: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=200&q=80',
                shortDescription: 'Mix tropical sin azúcar añadida ideal para retail.'
            },
            {
                id: 23,
                portalId: 'el-roble',
                name: 'Café en Grano Reserva',
                category: 'Bebidas',
                price: 9900,
                stock: 36,
                status: 'Disponible',
                statusClass: 'success',
                image: 'https://images.unsplash.com/photo-1507919989808-dc8e2f1b1c01?auto=format&fit=crop&w=200&q=80',
                shortDescription: 'Blend gourmet con certificación de comercio justo.'
            }
        ],
        inventoryAdjustments: [
            {
                id: 301,
                productId: 11,
                productName: 'Paquete Gourmet Café',
                type: 'Entrada',
                quantity: 24,
                direction: 1,
                reason: 'Reposición semanal de proveedor',
                date: '2024-08-17T09:10:00Z'
            },
            {
                id: 302,
                productId: 15,
                productName: 'Selección de Quesos Locales',
                type: 'Salida',
                quantity: 3,
                direction: -1,
                reason: 'Pedido urgente para Boutique Azul',
                date: '2024-08-16T17:45:00Z'
            },
            {
                id: 303,
                productId: 17,
                productName: 'Licores Artesanales',
                type: 'Ajuste manual',
                quantity: 1,
                direction: -1,
                reason: 'Producto dañado durante transporte',
                date: '2024-08-15T11:30:00Z'
            }
        ],
        settings: {
            companyName: 'Catálogo Digital CR',
            companyEmail: 'ventas@catalogodigital.cr',
            companyPhone: '+506 4000-2020',
            companyAddress: 'San José, Costa Rica',
            tagline: 'Administra tu negocio en un solo lugar',
            themeColor: '#6366f1',
            logoUrl: ''
        },
        portals: [
            {
                id: 'catalogo-digital',
                slug: 'catalogo-digital',
                name: 'Catálogo Digital CR',
                description: 'Portafolio gourmet para clientes mayoristas.',
                contactEmail: 'ventas@catalogodigital.cr',
                contactPhone: '+506 4000-2020',
                heroTitle: 'Descubre nuestra selección gourmet',
                heroSubtitle: 'Productos artesanales y de origen local para tu negocio.',
                accentColor: '#6366f1',
                bannerImage: 'https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?auto=format&fit=crop&w=1200&q=80',
                productIds: [11, 12, 13, 14, 15, 16, 17],
                terms: [
                    'Precios expresados en colones costarricenses (CRC).',
                    'Pedidos sujetos a confirmación de disponibilidad.',
                    'Entregas dentro del GAM en un máximo de 48 horas hábiles.'
                ]
            },
            {
                id: 'el-roble',
                slug: 'distribuidora-el-roble',
                name: 'Distribuidora El Roble',
                description: 'Catálogo mayorista de abarrotes, bebidas y snacks premium.',
                contactEmail: 'compras@elroble.cr',
                contactPhone: '+506 2250-1122',
                heroTitle: 'Selección exclusiva para tus puntos de venta',
                heroSubtitle: 'Suministro constante y precios competitivos para tu negocio.',
                accentColor: '#16a34a',
                bannerImage: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1200&q=80',
                productIds: [21, 22, 23],
                terms: [
                    'Pedidos mínimos de ₡100 000 para envío gratuito.',
                    'Facturación electrónica incluida con cada entrega.',
                    'Atención personalizada para aperturas y eventos especiales.'
                ]
            }
        ]
    };
}

export function getPortalBySlug(slug) {
    const data = getInitialDashboardData();
    return data.portals.find((portal) => portal.slug === slug);
}
