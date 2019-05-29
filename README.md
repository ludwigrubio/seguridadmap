# Seguridad Map

Seguridad Map es una herramienta tecnológica de código abierto desarrollada en el marco del programa [Retos Jalisco](https://retos.jalisco.gob.mx/) del gobierno del estado de Jalisco.
 
Esta herramienta automatiza el registro, seguimiento, manejo de información y análisis de datos, de manera suficiente, veraz, oportuna y actualizada para la toma de decisiones en materia de seguridad, marginación y pobreza, que permite a los diferentes actores involucrados compartir e intercambiar información en diferentes coberturas del Estado de Jalisco, tales como son: Municipios, AGEBS y Colonias.

La aplicación integra bases de datos de delitos de la Fiscalía General del Estado, e información geográfica-estadística del Instituto de Información Estadística y Geográfica.


##Tecnologías

Seguridad Map está construido con las siguientes tecnologías Open Source:

   * [Spring + JHipster Generator](http://www.jhipster.tech/)
   * [Geoserver](http://geoserver.org/)
   * [OpenLayers](https://openlayers.org/)
   * [AngularJS](https://angularjs.org/)
   * [PostgreSQL](https://www.postgresql.org/)


## Desarrollo


Antes de correr este proyecto, deberás instalar y configurar las siguientes dependencias en tu equipo:

__[Node.js]__:  Usamos _Node_ para correr un servidor web de desarrollo y construir el proyecto.
Dependiendo de su sistema operativo podrá instalar _Node_ vía consola, o con un instalador.

Después de instalar _Node_ podrá correr el siguiente comando para instalar algunas herramientas de desarrollo
(como __[Bower]__ y __[BrowserSync]__).Deberás correr éste comando nuevamente cada vez que las dependencias 
cambien dentro del archivo _package.json_

    npm install

Usamos __[Gulp]__ como automatizador de tareas. Instale la herramienta de manera global con el siguiente comando:

    npm install -g gulp-cli

Ejecute los siguientes comandos en dos terminales separados para crear una experiencia de desarrollo ágil donde su navegador
se actualiza automáticamente cuando los archivos cambien.

    ./mvnw
    gulp

Bower se utiliza para administrar las dependencias CSS y JavaScript utilizadas en esta aplicación. Puede actualizar las dependencias
especificando una versión más reciente en el archivo 'bower.json'. También puede ejecutar 'bower update' y 'bower install' para administrar las dependencias.
Agregue el indicador _'-h'_ en cualquier comando para ver obtener ayuda del cómo puede utilizarlo. Por ejemplo: _'bower update -h'_.


## Producción

Para optimizar la aplicación Seguridad Map para un ambiente de producción, ejecute:

    ./mvnw -Pprod clean package

Esto concatenará y comprimirá los archivos CSS y JavaScript del cliente. También modificará el archivo 'index.html' para que haga referencia a estos nuevos archivos.
Para asegurar que todo funcionó, ejecute:

    java -jar target / *. war

Deberá ingresar a [http://localhost:8080](http://localhost:8080) en el navegador de su preferencia.


## Tests

Para iniciar los test de su aplicación, ejecute:
    
    ./mvnw test clean

### Unit tests

Las pruebas unitarias son ejecutadas por _[Karma]_ y escritas con _[Jasmine]_. Están ubicados dentro del proyecto en la ruta
'src/test/javascript/' y se pueden ejecutar con:

    gulp test


### Otros test

Las pruebas de rendimiento son dirigidas por __[Gatling]__ y escritas en Scala. Están ubicados en  la ruta 'src/test/gatling' y se pueden ejecutar con:

    ./mvnw gatling:execute


##Configuraciones


Para lograr la ejecución exitosa de este proyecto deberá tomar en cuenta las siguientes configuraciones:

### Geoserver

Para la correcta utilización de este proyecto deberá montar su propio Geoserver, siguiendo las siguientes indicaciones:
 
1. Instale una instancia de _[Geoserver 2.9.4]_ revise la documentación en el sitio oficial [Geoserver.](http://docs.geoserver.org/)
1. Monte en una nueva base de datos postgres en el mismo servidor de la aplicación Geoserver, el respaldo de base de datos postgreSQL 
dentro del directorio 'assets/shp_mapaseguridad.zip'
1. Una vez realizados los pasos anteriores, reemplace el directorio __data__ dentro de su instalación de Geoserver por el contenido
en el directorio 'assets/data.zip' dentro de este proyecto, esta carpeta contiene workspaces, capas, estilos, etc. 
1. Verifique que pueda acceder a las previsualización de las capas ingresando a su aplicación Geoserver en el menú "Layers Preview",
en caso de no tener una previsualización exitosa ingrese a editar cada capa, en de la parte inferior haga clic en la opción "Reload feature type".


### Variables Globales

Para que su aplicativo se comunique con los servicios web de su Geoserver deberá seguir los siguientes pasos:


Diríjase al archivo 'gulp/config.json' dentro de este proyecto, localice las siguientes variables y coloque valores,
 como los siguientes, o en su caso del dominio que usted definió.
    

* Dominio de la aplicación:

        baseDomainUrl: http://geodelito.example

* Texto del dominio que será remplazado para la visualización dentro de textos en la aplicación:

        baseDomainText: geodelito.example
                
* URL de servicos WMS de su geoserver instalado:

        baseWMSURL: http://geodelito.example/geoserver/mapa_jalisco/wms


##CUENTAS DE ACCESO

Una vez montado, se habrán creado 3 cuetas de manera automática por cada uno de los diferentes roles
que pueden utilizar esta plataforma:

####Administrador
__Usuario__: Admin / 
__Contraseña__: Admin


####Investigador
__Usuario__: Investigador /
__Contraseña__: Investigador


####Ciudadano
__Usuario__: Ciudadano /
__Contraseña__: Ciudadano


##LICENCIAMIENTO

[GNU AFFERO GENERAL PUBLIC LICENSE](https://www.gnu.org/licenses/licenses.es.html#AGPL)
