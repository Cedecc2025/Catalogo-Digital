# Supabase setup for Catálogo Digital

Este directorio contiene los scripts SQL necesarios para aprovisionar la base de datos que espera la aplicación.

## Archivos

- `schema.sql`: crea todas las tablas, relaciones y políticas de seguridad (RLS) requeridas por el dashboard interno y el portal público de clientes.
- `seed.sql`: opcional. Inserta datos de ejemplo para que puedas probar la interfaz inmediatamente después de crear las tablas.

## Cómo usar estos scripts

1. Ingresa a tu proyecto de Supabase y abre la pestaña **SQL editor**.
2. Crea una nueva consulta y pega el contenido completo de `schema.sql`. Ejecuta la consulta para crear la estructura. Si ya habías ejecutado una versión previa, vuelve a correr el script: incluye `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` para incorporar automáticamente los campos nuevos (por ejemplo los estados de solicitudes del portal) sin necesidad de limpiar la base de datos.
3. (Opcional) Ejecuta el contenido de `seed.sql` para cargar un conjunto mínimo de configuración, un portal público y datos de prueba.
4. Ajusta el valor de `portal_base_url` dentro del seed para que coincida con el dominio donde alojas la aplicación. El marcador `{{slug}}` se reemplaza automáticamente por el identificador de cada portal cuando se generan enlaces.
5. El seed incluye una solicitud de venta de muestra en `sale_requests` para validar que el dashboard reciba pedidos del portal público.

## Tablas principales

| Tabla | Propósito | Campos clave |
| --- | --- | --- |
| `clients` | Clientes del CRM | `name`, `email`, `phone`, `status`, `notes` |
| `products` | Catálogo de productos internos y públicos | `name`, `category`, `price`, `stock`, `portal_id`, `portal_slug`, `image` |
| `sales` | Historial de ventas registradas desde el dashboard | `sale_date`, `total`, `status`, `payment_method`, `client_id`, `items` |
| `inventory_adjustments` | Movimientos de inventario para cada producto | `product_id`, `type`, `quantity`, `direction`, `reason` |
| `settings` | Configuración general de la empresa y branding | `key`, `value` |
| `portals` | Portales públicos compartibles | `slug`, `name`, `description`, `accent_color`, `terms`, `product_ids` |
| `sale_requests` | Solicitudes enviadas desde el portal público | `portal_slug`, `name`, `email`, `items`, `total`, `submitted_at`, `status`, `status_class`, `processed_at`, `processed_by`, `sale_id` |

### Consideraciones de seguridad

- Las tablas `products` y `portals` permiten lecturas públicas (`anon`) para que el portal de clientes pueda cargar información sin requerir autenticación.
- El resto de operaciones (insertar, actualizar, eliminar) solo están habilitadas para usuarios autenticados (`auth.role() = 'authenticated'`).
- Las solicitudes de venta (`sale_requests`) aceptan inserciones anónimas para permitir que cualquier cliente envíe su pedido y exponen campos de estado (`status`, `status_class`, `processed_at`, `processed_by`, `sale_id`) que el dashboard actualiza cuando conviertes la solicitud en una venta.

### Próximos pasos sugeridos

- Completa la lógica en el dashboard para realizar operaciones `insert`, `update` y `delete` contra estas tablas utilizando el cliente de Supabase.
- Configura funciones de Realtime o Webhooks si necesitas notificaciones al recibir nuevas solicitudes (`sale_requests`).

Con estos scripts la aplicación queda lista para conectarse a Supabase y trabajar sin datos precargados en el frontend.
