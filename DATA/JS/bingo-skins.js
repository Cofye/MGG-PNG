// Inicialización optimizada para diseño responsivo y prioridad absoluta de Viewport
document.addEventListener('DOMContentLoaded', () => {
  // Ocultar todas las etiquetas .tag inicialmente
  document.querySelectorAll('.tag').forEach(tag => tag.classList.add('hidden'));

  const mutants = document.querySelectorAll('.mutant');
  const mutantStateMap = new Map();

  // 1. Preparar cada mutante de forma limpia (Lazy Load)
  mutants.forEach(mutant => {
    const img = mutant.querySelector('.png, .pnghd');
    if (!img) return;

    // Guardar src original y quitarlo para la carga diferida
    if (img.src && !img.dataset.src) {
      img.dataset.src = img.src;
      img.removeAttribute('src');
    }
    
    // Ocultar la imagen hasta que termine de cargar
    img.classList.add('hidden');

    // Crear y añadir el loader individual
    const loader = document.createElement('img');
    loader.className = 'loader';
    loader.src = '../IMG/tab-loading.gif'; 
    loader.alt = 'loading';
    mutant.appendChild(loader);

    const tag = mutant.querySelector('.tag');

    // Mapeo del estado del elemento
    mutantStateMap.set(mutant, {
      mutant: mutant,
      loader: loader,
      img: img,
      tag: tag,
      resolved: false,
      isHd: img.classList.contains('pnghd'),
      loadingStarted: false,   // NUEVO: Controla si ya se inició la petición HTTP
      onResolveCallback: null  // NUEVO: Avisa a la cola secuencial cuando termina
    });
  });

  // 2. Función para resolver el estado del mutante (Mostrarlo o manejar error)
  function resolveMutant(state) {
    if (state.resolved) return;
    state.resolved = true;

    // Eliminar el loader del DOM de forma segura
    if (state.loader) {
      state.loader.remove();
    }

    // Verificar si la imagen cargó correctamente
    if (state.img && state.img.naturalWidth > 0) {
      state.img.classList.remove('hidden');
      // Mostrar etiqueta HD si corresponde
      if (state.isHd && state.tag) {
        state.tag.classList.remove('hidden');
      }
    } else {
      // Si la imagen falla o no existe, ocultamos el contenedor del mutante para no romper el grid
      state.mutant.classList.add('hidden');
    }

    // NUEVO: Si este mutante fue activado por la cola de segundo plano, ejecuta su callback
    if (typeof state.onResolveCallback === 'function') {
      state.onResolveCallback();
    }
  }

  // 3. Función que inicia la descarga real de la imagen
  function startLoadingMutant(state, callback = null) {
    // Si ya comenzó a cargar por scroll, saltamos inmediatamente al siguiente en la cola
    if (state.loadingStarted) {
      if (callback) callback();
      return;
    }

    state.loadingStarted = true;
    if (callback) state.onResolveCallback = callback;

    const img = state.img;
    if (img && img.dataset.src) {
      img.src = img.dataset.src;
      
      // Uso de { once: true } para liberar memoria RAM inmediatamente
      img.addEventListener('load', () => resolveMutant(state), { once: true });
      img.addEventListener('error', () => resolveMutant(state), { once: true });
    } else {
      resolveMutant(state);
    }
  }

  // 4. Intersection Observer configurado para dar prioridad máxima al Viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const state = mutantStateMap.get(entry.target);
        if (state && !state.loadingStarted) {
          // Carga inmediata prioritaria
          startLoadingMutant(state);
          // Dejar de observar inmediatamente para enfocar recursos del CPU
          observer.unobserve(entry.target);
        }
      }
    });
  }, { 
    rootMargin: '350px', // Carga las imágenes 350px antes de que aparezcan en pantalla
    threshold: 0.01 
  });

  // Activar la observación en todos los mutantes mapeados
  mutantStateMap.forEach((_, mutant) => {
    observer.observe(mutant);
  });

  // 5. NUEVA COLA EN SEGUNDO PLANO ESTRICTAMENTE SECUENCIAL
  // Descarga un mutante a la vez en "fila india", dejando la red libre si el usuario hace scroll
  const loadRemainingMutantsSequentially = () => {
    const statesArray = Array.from(mutantStateMap.values());
    let currentIndex = 0;

    function processNext() {
      // Avanzar en la lista si el mutante ya empezó a cargarse mediante el scroll
      while (currentIndex < statesArray.length && statesArray[currentIndex].loadingStarted) {
        currentIndex++;
      }

      // Si ya procesamos todos los elementos, la cola termina limpiamente
      if (currentIndex >= statesArray.length) return;

      const nextState = statesArray[currentIndex];
      currentIndex++;

      // Iniciamos la carga pasándole 'processNext' como callback.
      // Cuando la imagen cargue o falle, esperará 150ms de descanso y procesará el siguiente.
      startLoadingMutant(nextState, () => {
        setTimeout(processNext, 150);
      });

      // Lo dejamos de observar ya que la cola se encargará de él
      observer.unobserve(nextState.mutant);
    }

    processNext(); // Arrancar el bucle secuencial
  };

  // Ejecutar la cola secuencial solo cuando el navegador experimente tiempos muertos (Idle)
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => setTimeout(loadRemainingMutantsSequentially, 2000));
  } else {
    setTimeout(loadRemainingMutantsSequentially, 3500); // Soporte para navegadores antiguos
  }
},

function() {
  const overlay = document.getElementById('overlay');
  const modal = document.getElementById('modal');
  const bigPngImg = document.querySelector('.bigpng');
  const bigPngLink = bigPngImg?.closest('a');
  const bigPngHdImg = document.querySelector('.bigpnghd');
  const bigPngHdLink = bigPngHdImg?.closest('a');
  const bigVersionImg = document.querySelector('.bigversion');

  // Función para limpiar el modal
  function limpiarModal() {
    if (bigPngImg) bigPngImg.src = '';
    if (bigPngHdImg) bigPngHdImg.src = '';
    if (bigVersionImg) bigVersionImg.src = '';
    if (bigPngLink) {
      bigPngLink.href = '#';
      bigPngLink.removeAttribute('download');
    }
    if (bigPngHdLink) {
      bigPngHdLink.href = '#';
      bigPngHdLink.removeAttribute('download');
    }
  }

  // Abrir modal mostrando SOLO la imagen clickeada y su versión correspondiente
  function abrirModal(tipo, src, versionSrc) {
    limpiarModal(); // Limpiar antes de llenar

    if (tipo === 'png') {
      if (bigPngImg && bigPngLink) {
        bigPngImg.src = src;
        bigPngLink.href = src;
        bigPngLink.download = src.split('/').pop();
      }
    } else if (tipo === 'pnghd') {
      if (bigPngHdImg && bigPngHdLink) {
        bigPngHdImg.src = src;
        bigPngHdLink.href = src;
        bigPngHdLink.download = src.split('/').pop();
      }
    }

    // Si hay imagen de versión, mostrarla
    if (versionSrc && bigVersionImg) {
      bigVersionImg.src = versionSrc;
    }

    overlay.classList.remove('hidden');
    modal.classList.remove('hidden');
  }

  // Delegación de eventos en el contenedor principal
  const contenedor = document.getElementById('scale-container');
  if (contenedor) {
    contenedor.addEventListener('click', function(e) {
      const target = e.target;
      // Verificar que el clic sea en una imagen .png o .pnghd
      if (target.classList && (target.classList.contains('png') || target.classList.contains('pnghd'))) {
        const mutant = target.closest('.mutant');
        if (mutant) {
          // Determinar el tipo de imagen clickeada
          const tipo = target.classList.contains('png') ? 'png' : 'pnghd';
          const srcClickeada = target.src;

          // Buscar la imagen de versión dentro del mismo mutant
          const versionImg = mutant.querySelector('.version');
          const versionSrc = versionImg ? versionImg.src : '';

          abrirModal(tipo, srcClickeada, versionSrc);
        }
      }
    });
  }

  // Cerrar modal al hacer clic en el overlay (fondo)
  if (overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        overlay.classList.add('hidden');
        modal.classList.add('hidden');
        limpiarModal(); // Limpiar al cerrar para que no quede contenido
      }
    });
  }
}

);