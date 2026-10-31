-- Migración de los 27 precios REALES de data.js, idempotente.
-- Ejecutar sólo tras bn_prices_schema.sql en un proyecto dedicado.
insert into public.bn_services(id,name,category,price_clp,duration,description,popular,display_order)
values
('s01','Esmaltado semipermanente','Uñas manos',10000,'60 min','Esmaltado gel de larga duración que mantiene el color perfecto por semanas.',true,1),
('s02','Esmaltado gel builder','Uñas manos',15000,'75 min','Gel builder que fortalece y embellece la uña natural con un acabado impecable.',true,2),
('s03','Esmaltado francesa','Uñas manos',12000,'70 min','Clásica francesa que nunca pasa de moda, elegante y atemporal.',false,3),
('s04','Esmaltado plus decorado','Uñas manos',14000,'80 min','Esmaltado semipermanente con diseño artístico personalizado.',true,4),
('s05','Manicura clásica','Uñas manos',8000,'45 min','Manicura tradicional con limado, cutícula y esmaltado normal.',false,5),
('s06','Nail art','Uñas manos',null,'Según diseño','Arte en uñas personalizado: flores, figuras geométricas, personajes y más.',false,6),
('s07','Reconstrucción','Uñas manos',18000,'90 min','Reconstrucción de uñas quebradas o dañadas para devolverles la forma.',false,7),
('s08','Full set semipermanente','Uñas manos',20000,'100 min','Servicio completo con limpieza, forma y esmaltado semipermanente en todas las uñas.',true,8),
('s09','Relleno semipermanente','Uñas manos',12000,'60 min','Relleno del crecimiento para mantener el esmaltado semipermanente perfecto.',false,9),
('s10','Soft Gel Manicure','Extensiones',22000,'90 min','Extensiones de soft gel que imitan la uña natural con resultado ultrarealista.',true,10),
('s11','Soft Gel Tips','Extensiones',25000,'100 min','Tips de soft gel para añadir largo de forma natural y resistente.',false,11),
('s12','Press On','Extensiones',18000,'60 min','Uñas press on premium personalizadas, listas en minutos.',false,12),
('s13','Acrílicas / Polygel','Extensiones',28000,'120 min','Sistema de uñas con acrílico o polygel para máxima resistencia y largo.',true,13),
('s14','Pedicura básica','Uñas pies',10000,'50 min','Pedicura esencial con limpieza, cortado y esmaltado.',false,14),
('s15','Pedicura semipermanente','Uñas pies',15000,'70 min','Pedicura con esmaltado semipermanente de larga duración.',true,15),
('s16','Pedicura spa','Uñas pies',18000,'80 min','Experiencia spa completa con exfoliación, hidratación y esmaltado.',false,16),
('s17','Pedicura deluxe','Uñas pies',22000,'90 min','La experiencia más completa: spa + semipermanente + decorado.',false,17),
('s18','Combo manos + pies','Promociones',24000,'120 min','Esmaltado semipermanente manos y pies al mejor precio.',true,18),
('s19','Retiro de esmalte','Retiros',5000,'30 min','Retiro seguro de esmaltado semipermanente o gel sin dañar la uña.',false,19),
('s20','Retiro extensiones','Retiros',8000,'45 min','Retiro profesional de acrílico, polygel o soft gel.',false,20),
('s21','Diseño de cejas','Pestañas y cejas',8000,'40 min','Diseño y perfilado de cejas personalizado según tu morfología facial.',true,21),
('s22','Lifting de pestañas + cejas','Pestañas y cejas',25000,'90 min','Lifting que riza y levanta las pestañas naturales con efecto duradero.',true,22),
('s23','Laminado de cejas','Pestañas y cejas',20000,'60 min','Laminado que peina y fija las cejas en la dirección perfecta.',false,23),
('s24','Planchado de cejas','Pestañas y cejas',15000,'50 min','Planchado que alisa y define las cejas para un look moderno y ordenado.',false,24),
('s25','Depilación facial','Pestañas y cejas',6000,'30 min','Depilación de bozo, patillas y contorno facial con hilo o cera.',false,25),
('s26','Mascarilla manos','Extras',5000,'20 min','Mascarilla hidratante intensiva para manos suaves y nutridas.',false,26),
('s27','Parafina pies','Extras',6000,'25 min','Tratamiento de parafina para pies suaves e hidratados.',false,27)
on conflict (id) do nothing;
