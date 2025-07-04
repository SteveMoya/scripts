const fs = require('fs').promises; // Usando promesas para operaciones asíncronas
const fsSync = require('fs'); // Importar el módulo fs sin promesas para usar existsSync
const path = require('path');
const readline = require('readline'); // Para entrada del usuario

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function organizarArchivos() {
    // Obtener argumentos de línea de comandos
    const args = process.argv.slice(2);
    let rutaDirectorioArg = args[0] || '';

    rl.question('¿Desea incluir archivos ocultos y de sistema? (s/n): ', async (incluirOcultos) => {
        const incluirArchivosOcultos = incluirOcultos.trim().toLowerCase() === 's';
        if (rutaDirectorioArg) {
            // Si se pasa la ruta como argumento, usarla directamente
            var rutaDirectorio = rutaDirectorioArg;
            if (!rutaDirectorio.trim()) {
                rutaDirectorio = __dirname;
                console.log(`No se ingresó ruta. Usando la carpeta del script: ${rutaDirectorio}`);
            }
            // Validar si el directorio existe
            try {
                await fs.access(rutaDirectorio);
            } catch (error) {
                console.error(`Error: El directorio "${rutaDirectorio}" no existe o no es accesible.`);
                rl.close();
                return;
            }

            console.log(`\nIniciando organización en: ${rutaDirectorio}`);

            // Definir reglas de organización
            const carpetasPorTipo = {
                imagenes: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'svg', 'ico', 'heic', 'avif'],
                documentos: ['pdf', 'txt', 'rtf', 'odt', 'md'],
                videos: ['mp4', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'webm', 'mpeg', '3gp', 'm4v'],
                audio: ['mp3', 'wav', 'aac', 'flac', 'ogg'],
                comprimidos: ['zip', 'rar', 'tar', 'gz', '7z'],
                codigo: ['js', 'py', 'java', 'c', 'cpp', 'html', 'css', 'php', 'rb', 'go'],
                ejecutables: ['exe', 'bat', 'sh', 'msi'],
                fuentes: ['ttf', 'otf', 'woff', 'woff2'],
                presentaciones: ['ppt', 'pptx'],
                hojas_calculo: ['xls', 'xlsx', 'ods'],
                correos: ['eml', 'msg'], // Archivos de correo
                ebooks: ['epub', 'mobi', 'azw3'], // Formatos de eBook
                word: ['doc', 'docx'], // Documentos Word
                texto: ['txt', 'md', 'rtf'],
                datos: ['csv', 'tsv', 'json'],
                logs: ['log'], // Archivos de registro
                respaldos: ['bak', 'backup', 'old'], // Extensiones comunes de respaldo
                bases_datos: ['db', 'sql', 'sqlite'], // Archivos de base de datos
                ilustraciones: ['ai', 'xd'], // Archivos de diseño
                photoshop: ['psd'], // Archivos de Photoshop
                lightroom: ['lrcat'], // Catálogos de Lightroom
                luts: ['cube', '3dl'], // Archivos LUT
                iso: ['iso', 'img', 'bin'], // Imágenes de disco
                torrents: ['torrent'], // Archivos torrent
                otros: [] // Para archivos que no coincidan con los anteriores
            };

            // Definir reglas de organización por prefijo
            // La clave es el prefijo, el valor es el nombre de la carpeta
            const carpetasPorPrefijo = {
                'reporte_': 'Reportes',
                'factura_': 'Facturas',
                'proyecto_A_': 'Archivos Proyecto A',
                // Agregue más reglas de prefijo según sea necesario
            };

            try {
                const resumen = {};
                await procesarDirectorio(rutaDirectorio, carpetasPorTipo, carpetasPorPrefijo, incluirArchivosOcultos, resumen);
                mostrarResumen(resumen);
                console.log('\n¡Organización de archivos completa!');
            } catch (error) {
                console.error('Ocurrió un error durante la organización:', error);
            } finally {
                rl.close();
            }
        } else {
            rl.question('Ingrese la ruta completa de la carpeta a organizar (deje vacío para usar la carpeta del script): ', async (rutaDirectorio) => {
                // Si el usuario no ingresa nada, usar la carpeta del script
                if (!rutaDirectorio.trim()) {
                    rutaDirectorio = __dirname;
                    console.log(`No se ingresó ruta. Usando la carpeta del script: ${rutaDirectorio}`);
                }
                // Validar si el directorio existe
                try {
                    await fs.access(rutaDirectorio);
                } catch (error) {
                    console.error(`Error: El directorio "${rutaDirectorio}" no existe o no es accesible.`);
                    rl.close();
                    return;
                }

                console.log(`\nIniciando organización en: ${rutaDirectorio}`);

                // Definir reglas de organización
                const carpetasPorTipo = {
                    imagenes: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'svg', 'ico', 'heic', 'avif'],
                    documentos: ['pdf', 'txt', 'rtf', 'odt', 'md'],
                    videos: ['mp4', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'webm', 'mpeg', '3gp', 'm4v'],
                    audio: ['mp3', 'wav', 'aac', 'flac', 'ogg'],
                    comprimidos: ['zip', 'rar', 'tar', 'gz', '7z'],
                    codigo: ['js', 'py', 'java', 'c', 'cpp', 'html', 'css', 'php', 'rb', 'go'],
                    ejecutables: ['exe', 'bat', 'sh', 'msi'],
                    fuentes: ['ttf', 'otf', 'woff', 'woff2'],
                    presentaciones: ['ppt', 'pptx'],
                    hojas_calculo: ['xls', 'xlsx', 'ods'],
                    correos: ['eml', 'msg'], // Archivos de correo
                    ebooks: ['epub', 'mobi', 'azw3'], // Formatos de eBook
                    word: ['doc', 'docx'], // Documentos Word
                    texto: ['txt', 'md', 'rtf'],
                    datos: ['csv', 'tsv', 'json'],
                    logs: ['log'], // Archivos de registro
                    respaldos: ['bak', 'backup', 'old'], // Extensiones comunes de respaldo
                    bases_datos: ['db', 'sql', 'sqlite'], // Archivos de base de datos
                    ilustraciones: ['ai', 'xd'], // Archivos de diseño
                    photoshop: ['psd'], // Archivos de Photoshop
                    lightroom: ['lrcat'], // Catálogos de Lightroom
                    luts: ['cube', '3dl'], // Archivos LUT
                    otros: [] // Para archivos que no coincidan con los anteriores
                };

                // Definir reglas de organización por prefijo
                // La clave es el prefijo, el valor es el nombre de la carpeta
                const carpetasPorPrefijo = {
                    'reporte_': 'Reportes',
                    'factura_': 'Facturas',
                    'proyecto_A_': 'Archivos Proyecto A',
                    // Agregue más reglas de prefijo según sea necesario
                };

                try {
                    const resumen = {};
                    await procesarDirectorio(rutaDirectorio, carpetasPorTipo, carpetasPorPrefijo, incluirArchivosOcultos, resumen);
                    mostrarResumen(resumen);
                    console.log('\n¡Organización de archivos completa!');
                } catch (error) {
                    console.error('Ocurrió un error durante la organización:', error);
                } finally {
                    rl.close();
                }
            });
        }
    });
}

async function procesarDirectorio(directorioActual, carpetasPorTipo, carpetasPorPrefijo, incluirArchivosOcultos, resumen) {
    const archivos = await fs.readdir(directorioActual, { withFileTypes: true });
    const rutaLog = path.join(__dirname, 'organizador_errores.log');

    // Procesar archivos en paralelo, pero limitar la concurrencia para evitar saturar el sistema
    const CONCURRENCIA_MAX = 3; // Valor reducido para mayor robustez
    let indice = 0;

    async function procesarArchivo(archivo) {
        try {
            // Log para saber qué archivo se está procesando
            console.log(`[INFO] Procesando: ${archivo.name}`);
            // Omitir archivos ocultos (que empiezan con punto) si el usuario no quiere incluirlos
            if (!incluirArchivosOcultos && archivo.name.startsWith('.')) {
                return;
            }
            // Omitir archivos de sistema comunes en Windows
            if (!incluirArchivosOcultos && ['Thumbs.db', 'desktop.ini'].includes(archivo.name)) {
                return;
            }
            const rutaCompleta = path.join(directorioActual, archivo.name);
            if (archivo.isDirectory()) {
                // No entrar a subcarpetas ni procesarlas
                return;
            } else {
                // Es un archivo, vamos a organizarlo
                const extensionArchivo = path.extname(archivo.name).toLowerCase().slice(1); // Quitar el punto
                const nombreArchivo = archivo.name.toLowerCase();
                let carpetaDestino = 'Otros'; // Carpeta por defecto

                // 1. Verificar organización por prefijo
                let prefijoCoincide = false;
                for (const prefijo in carpetasPorPrefijo) {
                    if (nombreArchivo.startsWith(prefijo.toLowerCase())) {
                        carpetaDestino = carpetasPorPrefijo[prefijo];
                        prefijoCoincide = true;
                        break;
                    }
                }

                // 2. Si no coincide prefijo, verificar por tipo
                if (!prefijoCoincide) {
                    for (const tipo in carpetasPorTipo) {
                        if (carpetasPorTipo[tipo].includes(extensionArchivo)) {
                            carpetaDestino = tipo.charAt(0).toUpperCase() + tipo.slice(1);
                            break;
                        }
                    }
                }

                const dirDestino = path.join(directorioActual, carpetaDestino);
                const nuevaRuta = path.join(dirDestino, archivo.name);

                // Crear la carpeta de destino si no existe
                await fs.mkdir(dirDestino, { recursive: true });

                // Mover el archivo
                try {
                    // Verificar si el archivo ya está en su destino correcto para evitar movimientos innecesarios
                    if (path.resolve(directorioActual) !== path.resolve(dirDestino) || !fsSync.existsSync(nuevaRuta)) {
                        let rutaFinal = nuevaRuta;
                        let contador = 1;
                        const ext = path.extname(archivo.name);
                        const nombreBase = path.basename(archivo.name, ext);
                        // Si ya existe un archivo con el mismo nombre en destino, renombrar el archivo nuevo
                        while (fsSync.existsSync(rutaFinal)) {
                            rutaFinal = path.join(dirDestino, `${nombreBase}_copia${contador}${ext}`);
                            contador++;
                        }
                        await fs.rename(rutaCompleta, rutaFinal);
                        // Contabilizar en el resumen
                        resumen[carpetaDestino] = (resumen[carpetaDestino] || 0) + 1;
                        if (rutaFinal !== nuevaRuta) {
                            console.log(`Movido y renombrado: "${archivo.name}" como "${path.basename(rutaFinal)}" a "${carpetaDestino}"`);
                        } else {
                            console.log(`Movido: "${archivo.name}" a "${carpetaDestino}"`);
                        }
                    } else {
                        console.log(`Omitido: "${archivo.name}" (ya está en la carpeta destino)`);
                    }
                } catch (errorMover) {
                    let mensajeError = '';
                    if (errorMover.code === 'EACCES' || errorMover.code === 'EPERM') {
                        mensajeError = `Permiso denegado al mover "${archivo.name}" a "${carpetaDestino}".\n`;
                    } else {
                        mensajeError = `No se pudo mover "${archivo.name}": ${errorMover.message}\n`;
                    }
                    console.error(mensajeError.trim());
                    await fs.appendFile(rutaLog, mensajeError);
                }
            }
        } catch (err) {
            const mensaje = `[ERROR] Fallo al procesar ${archivo.name}: ${err.message}\n`;
            console.error(mensaje.trim());
            await fs.appendFile(rutaLog, mensaje);
        }
    }

    // Procesar en lotes para limitar la concurrencia
    while (indice < archivos.length) {
        const lote = archivos.slice(indice, indice + CONCURRENCIA_MAX);
        await Promise.all(lote.map(archivo => procesarArchivo(archivo)));
        indice += CONCURRENCIA_MAX;
    }
}

function mostrarResumen(resumen) {
    console.log('\nResumen de archivos movidos por carpeta:');
    for (const carpeta in resumen) {
        console.log(`- ${carpeta}: ${resumen[carpeta]} archivo(s)`);
    }
}

// Iniciar el proceso de organización
organizarArchivos();