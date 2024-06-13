let manchas = [];
let layer = [];
let anchoImagen, altoImagen;
let clickCount = 0; // Contador de clics
let moveManchas = false; // Variable para controlar el movimiento de las manchas
let yOffsets = [100, 100, 100, 100]; // Desplazamientos verticales iniciales para cada capa
let showLayers = false; // Variable para controlar si se deben mostrar las capas
let backgrounds = [];
let timers = []; // Array para almacenar los temporizadores de las capas
let mic, fft; // Agregar FFT
let showText = true;
let textoMostrado = false;
let fondoCargado = false; // Variable para controlar si se ha cargado el fondo

function preload() {
  for (let i = 0; i < 40; i++) {
    let nombre = "imagenes/mancha" + nf(i, 2) + ".png";
    manchas[i] = loadImage(nombre);
  }

  for (let i = 1; i < 13; i++) {
    backgrounds.push(loadImage("imagenes/fondo" + nf(i, 2) + ".png"));
  }
}

function setup() {
  createCanvas(1535, 960);
  colorMode(HSB, 255, 255, 255, 255);
  
  // Crear las capas de gráficos
  for (let i = 0; i < 4; i++) {
    layer[i] = createGraphics(1535, 960);
  }

  // Redimensionar todas las imágenes
  anchoImagen = width / 5;
  altoImagen = height;

  // Inicializar el micrófono y FFT
  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT();
  fft.setInput(mic);
}

function draw() {
  // Si el texto aún no se ha mostrado y showText es verdadero, mostrar el texto
  if (!textoMostrado && showText) {
    // Esperar a que el usuario haga clic en la pantalla antes de iniciar el micrófono
    textSize(40);
    textAlign(CENTER);
    fill(0);
    text("Presiona la tecla Espacio para iniciar el micrófono", width / 2, height / 2);
    textoMostrado = true; // Marcar el texto como mostrado
  }

  if (!fondoCargado && !showText) {
    // Cargar el fondo cuando showText es falso y el fondo aún no se ha cargado
    let randomIndex = floor(random(backgrounds.length));
    background(backgrounds[randomIndex]);
    fondoCargado = true; // Marcar el fondo como cargado
  }

  // Si el micrófono está inicializado y corriendo
  if (mic) {
    // Obtener el nivel de amplitud del sonido capturado por el micrófono
    let volumen = mic.getLevel();
   
    // Limpiar el área donde se muestra el valor del volumen
    clearVolumeText();
  
    // Mostrar el valor del volumen en la pantalla
    fill(0); // Texto negro
    textSize(20);
    textAlign(CENTER, CENTER);
    text("Volumen: " + nf(volumen, 1, 2), width / 2, 20);

    // Obtener el espectro de frecuencias
    let spectrum = fft.analyze();

    // Obtener la frecuencia dominante
    let bass = fft.getEnergy("bass");
    let treble = fft.getEnergy("treble");

    // Mapear la frecuencia dominante a un valor entre 0 y 1
    let freqValue = map(bass, 0, 255, 0, 1);
    let freqValueTreble = map(treble, 0, 255, 0, 1);

    if (showLayers) {
      // Dibujar las imágenes en cada capa y aplicar tint inicial
      for (let i = 0; i < 4; i++) {
        if (yOffsets[i] === 0) { // Solo dibujar la capa si su yOffset es 0
          layer[i].clear();
          let x = 0;
          let y = yOffsets[i]; // Inicializar el desplazamiento vertical para la capa actual
          for (let j = 0; j < 5; j++) {
            let imagen = manchas[i * 5 + j];
            if (moveManchas) {
              // Mover las manchas en función del tiempo, dependiendo de la capa
              if (i === 0) {
                y += map(volumen, 0.01, 0.06, 0, 2, 5) * sin(frameCount * map(freqValue, 0, 1, 0.01, 0.2));
                x -= map(volumen, 0.01, 0.06, 2, 6) * sin(frameCount * map(freqValue, 0, 1, 0.01, 0.3));
              } else if (i === 1) {
                y += map(volumen, 0.01, 0.06, 2, 5) * sin(frameCount * map(freqValue, 0, 1, 0.01, 0.5));
                x -= map(volumen, 0.01, 0.06, 2, 8) * sin(frameCount * map(freqValue, 0, 1, 0.01, 0.7));
              } else if (i === 2) {
                y += map(volumen, 0.01, 0.06, 2, 4) * sin(frameCount * map(freqValueTreble, 0, 1, 0.01, 0.6));
                x -= map(volumen, 0.01, 0.06, 5, 7) * sin(frameCount * map(freqValueTreble, 0, 1, 0.01, 0.5));
              } else if (i === 3) {
                y += map(volumen, 0.01, 0.06, 2, 6) * sin(frameCount * map(freqValueTreble, 0, 1, 0.01, 0.4));
                x -= map(volumen, 0.01, 0.06, 2, 5) * sin(frameCount * map(freqValueTreble, 0, 1, 0.01, 0.7));
              }
            }
        
            // Aplicar tint para cada capa
            if (i === 1) {
              if (clickCount % 2 === 0) {
                let valueCapa2 = map(volumen, 0.01, 0.10, 60, 0);
                layer[i].tint(valueCapa2, 255); // Tint de la capa 2
              } else {
                let aclararCapa2 = map(volumen, 0.01, 0.10, 120, 60);
                layer[i].tint(color(20, 255, aclararCapa2, 255)); // Tint de la capa 3 en marrón
              }
            } else if (i === 2) {
              if (clickCount % 2 === 0) {
                layer[i].tint(color(38, 165, 255, 255)); // Tint de la capa 3 en amarillo
              } else {
                layer[i].tint(color(42, 165, 190, 255)); // Tint de la capa 3 en mostaza
              }
            } else if (i === 3) {
              if (clickCount % 2 === 0) {
                let valorCapa4 = map(volumen, 0.01, 0.10, 200, 100);
                layer[i].tint(color(170, 185, valorCapa4, 255)); // Tint de la capa 4 en azul
              } else {
                let aclararCapa2 = map(volumen, 0.01, 0.10, 255, 200);
                layer[i].tint(color(170, aclararCapa2, 255, 255)); // Tint de la capa 3 en marrón
              }
            }

            layer[i].image(imagen, x + 60, y + 60, anchoImagen - 120, altoImagen - 120); // Aplicar desplazamiento
            x += anchoImagen;
          }
        }
      }

      // Dibujar las capas en el lienzo principal
      for (let i = 0; i < 4; i++) {
        if (yOffsets[i] === 0) { // Solo dibujar la capa si su yOffset es 0
          image(layer[i], 0, 0);
        }
      }

      // Actualizar el tint de la primera capa según la posición del mouse
      if (yOffsets[0] === 0) { // Solo actualizar el tint de la primera capa si su yOffset es 0
        let mouseGray = map(freqValue, 0, 1, 70, 150);
        for (let j = 0; j < 5; j++) {
          let imagen = manchas[j];
          layer[0].tint(mouseGray); // Cambiar el tint de la primera capa según la posición del mouse
          layer[0].image(imagen, j * anchoImagen + 60, 30);
        }
      }
    }
  }
}

// Función para mezclar las imágenes aleatoriamente
function shuffleImages() {
  for (let i = manchas.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [manchas[i], manchas[j]] = [manchas[j], manchas[i]];
  }
}

// Función para mostrar las capas gradualmente
function showLayersGradually() {
  const delayInSeconds = 10; // Retardo de 10 segundos entre cada capa
  const delayInMilliseconds = delayInSeconds * 100; // Convertir segundos a milisegundos

  for (let i = 0; i < layer.length; i++) {
    // Guardar los temporizadores para poder cancelarlos si es necesario
    timers[i] = setTimeout(() => {
      yOffsets[i] = 0; // Ajustar el desplazamiento vertical de la capa
    }, i * delayInMilliseconds); // Aumentar el retardo para cada capa
  }
}

// Función para detectar clics en cualquier lugar
function mouseClicked() {
  // Verificar si las capas ya se han mostrado y si el fondo del lienzo no está en blanco
  if (showLayers && get(0, 0)[0]) {
    // Incrementar el contador de clics
    clickCount++;
    moveManchas = true; // Activar el movimiento de las manchas cuando se hace clic
  }
}

function keyPressed() {
  if (keyCode === 32) { // Tecla Espacio
    // Iniciar el micrófono si no está ya inicializado
    if (!mic.started) {
      mic.start();
    }
    // Ocultar el texto al presionar la tecla Espacio
    showText = false;
  }
  if (key === 'a' && !showLayers) {
    showLayers = true;
    showLayersGradually();
  } else if (key === 's') {
    // Cambiar el fondo directamente
    let randomIndex = floor(random(backgrounds.length));
    background(backgrounds[randomIndex]);
    resetCanvas();
  }
}

function resetCanvas() {
  showLayers = false; // Ocultar las capas
  clickCount = 0;
  moveManchas = false;
  yOffsets = [100, 100, 100, 100]; // Restablecer los desplazamientos verticales
  shuffleImages(); // Volver a mezclar las imágenes

  // Cancelar cualquier temporizador en progreso para mostrar las capas
  for (let i = 0; i < timers.length; i++) {
    clearTimeout(timers[i]); // Detener el temporizador
  }
  timers = []; // Reiniciar la lista de temporizadores

  // Ocultar las capas estableciendo los yOffsets a valores distintos de 0
  for (let i = 0; i < layer.length; i++) {
    yOffsets[i] = 100; // Restablecer el desplazamiento para cada capa
  }

  // Seleccionar un fondo aleatorio y aplicarle el tint con opacidad del 50%
  let randomIndex = floor(random(backgrounds.length));
  background(backgrounds[randomIndex]);
}

function clearVolumeText() {
  // Limpiar el área donde se muestra el valor del volumen
  fill(255); // Rellenar con blanco
  noStroke();
  rect(0, 0, width, 40); // Rectángulo para el fondo del número
}