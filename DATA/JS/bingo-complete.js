// Función principal que se ejecuta después de cargar y procesar la localización
function initAfterLocalization(localizationMap) {
  // --- Ocultar el loader global al iniciar el renderizado ---
  const loaderContainer = document.getElementById("loader-container");
  if (loaderContainer) loaderContainer.style.display = "none";

  const containers = document.querySelectorAll('.container');
  const visibleContainers = [];

  // 1. Filtrar y traducir contenedores basados en el mapa de localización
  containers.forEach(container => {
    const nameSpan = container.querySelector('.name');
    if (!nameSpan) {
      container.classList.add('hidden');
      return;
    }
    
    const code = nameSpan.textContent.trim().toLowerCase();
    
    if (localizationMap[code]) {
      nameSpan.textContent = localizationMap[code];
      container.classList.remove('hidden');
      visibleContainers.push(container);
    } else {
      container.classList.add('hidden');
    }
  });

  // Recolectar mutantes de los contenedores activos
  const mutants = [];
  visibleContainers.forEach(container => {
    mutants.push(...container.querySelectorAll('.mutant'));
  });

  if (mutants.length === 0) return;

  const mutantStateMap = new Map();

  // 2. Preparar el estado de cada mutante (Lazy Load)
  mutants.forEach(mutant => {
    const png = mutant.querySelector('.png');
    const pnghd = mutant.querySelector('.pnghd');
    const tag = mutant.querySelector('.tag');

    if (tag) tag.classList.add('hidden');

    [png, pnghd].forEach(img => {
      if (img) {
        if (img.src && !img.dataset.src) {
          img.dataset.src = img.src;
          img.removeAttribute('src');
        }
        img.classList.add('hidden');
      }
    });

    const loader = document.createElement('img');
    loader.className = 'loader';
    loader.src = '../IMG/tab-loading.gif';
    loader.alt = 'loading';
    mutant.appendChild(loader);

    mutantStateMap.set(mutant, {
      mutant: mutant,
      loader: loader,
      tag: tag,
      png: png,
      pnghd: pnghd,
      resolved: false,
      pngFailed: false,
      pnghdFailed: false,
      loadingStarted: false,
      onResolveCallback: null // Callback para avisar a la cola secuencial cuando termine
    });
  });

  // 3. Resolver el estado del mutante
  function resolveMutant(state, winnerType) {
    if (state.resolved) return;
    state.resolved = true;

    if (state.loader) {
      state.loader.remove();
    }

    if (winnerType === 'png' && state.png) {
      state.png.classList.remove('hidden');
    } else if (winnerType === 'pnghd' && state.pnghd) {
      state.pnghd.classList.remove('hidden');
      if (state.tag) state.tag.classList.remove('hidden');
    } else if (winnerType === null) {
      state.mutant.classList.add('hidden');
    }

    // NUEVO: Si este mutante tenía un callback asignado por la cola de segundo plano, lo ejecutamos
    if (typeof state.onResolveCallback === 'function') {
      state.onResolveCallback();
    }
  }

  // 4. Iniciar la carga (Acepta un callback opcional para el segundo plano)
  function startLoadingMutant(state, callback = null) {
    // Si ya empezó a cargar (por ejemplo, el usuario hizo scroll hacia él), saltamos al siguiente en la cola
    if (state.loadingStarted) {
      if (callback) callback();
      return;
    }
    
    state.loadingStarted = true;
    if (callback) state.onResolveCallback = callback;

    const imagesToLoad = [];
    if (state.png && state.png.dataset.src) imagesToLoad.push({ img: state.png, type: 'png' });
    if (state.pnghd && state.pnghd.dataset.src) imagesToLoad.push({ img: state.pnghd, type: 'pnghd' });

    if (imagesToLoad.length === 0) {
      resolveMutant(state, null);
      return;
    }

    imagesToLoad.forEach(({ img, type }) => {
      img.src = img.dataset.src;

      img.addEventListener('load', () => {
        if (!state.resolved) {
          resolveMutant(state, type);
        }
      }, { once: true });

      img.addEventListener('error', () => {
        if (state.resolved) return;
        
        if (type === 'png') state.pngFailed = true;
        else state.pnghdFailed = true;

        const canTryPng = state.png && !state.pngFailed;
        const canTryPnghd = state.pnghd && !state.pnghdFailed;
        
        if (!canTryPng && !canTryPnghd) {
          resolveMutant(state, null);
        }
      }, { once: true });
    });
  }

  // 5. Intersection Observer: Prioridad Máxima en Pantalla
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const state = mutantStateMap.get(entry.target);
        if (state && !state.loadingStarted) {
          // Carga inmediata sin pasar por cola de espera
          startLoadingMutant(state);
          observer.unobserve(entry.target);
        }
      }
    });
  }, { 
    rootMargin: '350px', // Margen de anticipación ligeramente mayor para suavizar transiciones
    threshold: 0.01 
  });

  mutantStateMap.forEach((_, mutant) => {
    observer.observe(mutant);
  });

  // 6. NUEVA COLA EN SEGUNDO PLANO ESTRICTAMENTE SECUENCIAL
  // Procesa un mutante a la vez, dejando el resto de conexiones libres para el scroll del usuario
  const loadRemainingMutantsSequentially = () => {
    const statesArray = Array.from(mutantStateMap.values());
    let currentIndex = 0;

    function processNext() {
      // Buscar el próximo mutante que no haya iniciado carga
      while (currentIndex < statesArray.length && statesArray[currentIndex].loadingStarted) {
        currentIndex++;
      }

      // Si terminamos con todos, finaliza la cola
      if (currentIndex >= statesArray.length) return;

      const nextState = statesArray[currentIndex];
      currentIndex++;

      // Le pasamos 'processNext' como callback. Así, cuando este mutante termine (load o error),
      // esperará 150ms de respiro y llamará automáticamente al siguiente de la lista.
      startLoadingMutant(nextState, () => {
        setTimeout(processNext, 150); 
      });
    }

    processNext(); // Iniciar el bucle de la cola
  };

  // Arrancar la cola secuencial cuando el navegador esté libre
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => setTimeout(loadRemainingMutantsSequentially, 2000));
  } else {
    setTimeout(loadRemainingMutantsSequentially, 3000);
  }
}

document.addEventListener('DOMContentLoaded', function() {
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
});

// Inicialización Principal (Punto de Entrada)
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.container').forEach(container => {
    container.classList.add('hidden');
  });

  fetch(`https://s-beta.kobojo.com/mutants/gameconfig/localisation_es.txt?nocache=${Date.now()}`)
    .then(res => {
      if (!res.ok) throw new Error('No se pudo cargar localisation_es.txt');
      return res.text();
    })
    .then(text => {
      const map = {};
      text.split(/\r?\n/).forEach(line => {
        if (!line) return;
        const [code, name] = line.split(';');
        if (code && name) {
          map[code.trim().toLowerCase()] = name.trim();
        }
      });
      initAfterLocalization(map);
    })
    .catch(err => {
      console.error("Error crítico:", err);
      const loaderContainer = document.getElementById("loader-container");
      if (loaderContainer) loaderContainer.style.display = "none";
    });
});