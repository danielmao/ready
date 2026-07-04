# Learnings

Tutoriales y notas de aprendizaje del proyecto **Ready**. A diferencia de `docs/`
(que documenta *qué es* el sistema), esta carpeta documenta *cómo aprendimos a
hacerlo*: guías paso a paso, decisiones y, sobre todo, los **tropiezos reales** y
cómo se resolvieron, para que la próxima vez (o la próxima persona) no choque con lo
mismo.

Pensado para alguien que está aprendiendo backend/DevOps, no para un experto que ya
sabe el camino.

## Índice

- [`01-primer-deploy-aws.md`](01-primer-deploy-aws.md) — Tu primer despliegue en AWS:
  una API NestJS en EC2 con Docker + Caddy (HTTPS automático), de cero a una URL
  pública, incluyendo los errores que aparecieron en el camino.
- [`02-imagenes-en-s3.md`](02-imagenes-en-s3.md) — Guardar imágenes en un bucket
  privado de S3 (y MinIO en local con el mismo código) desde una API NestJS
  hexagonal: puerto/adapter, servir por la API, y el IAM scopeado fuera de git.
