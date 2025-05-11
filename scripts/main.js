console.log("BetBros cargado correctamente.");

document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.getElementById("navbar");
    navbar.innerHTML = `
      <a class="navbar-brand" href="#">BetBros</a>
      <div>
        <button class="btn btn-outline-light me-2" onclick="goTo('register.html')">REGISTRATE AHORA</button>
        <button class="btn btn-light" onclick="goTo('login.html')">INICIAR SESIÓN</button>
      </div>
    `;

    const incio = document.getElementById("inicio");
    incio.innerHTML = `
<div class="container mt-5">
  <div class="row align-items-center">
    <!-- Columna izquierda: Explicación -->
          <h2 class="text-center mb-4">
        Apuesta con créditos, reta a tus amigos y demuestra quién acierta más.
      </h2>
    <div class="col-md-6">
      <section>
        <h3>¿Cómo funciona?</h3>
        <ul class="list-unstyled">
          <li>🔴 <strong>1. Crea una apuesta:</strong> Lanza una nueva. Ejemplo: “¿Quién gana el partido de esta noche?”</li>
          <li>🔵 <strong>2. Elige tu grupo:</strong> Únete a grupos públicos o crea privados.</li>
          <li>🟠 <strong>3. Apuesta y espera el resultado:</strong> Todos eligen una opción. Se reparten los créditos.</li>
          <li>🟢 <strong>4. Sube en el ranking:</strong> Gana puntos y destaca en tu grupo.</li>
        </ul>
      </section>
    </div>

    <!-- Columna derecha: Imagen -->
    <div class="col-md-6 text-center">
      <img src="images/amigosapostando.jpg" alt="Grupo de amigos apostando" class="img-fluid rounded shadow">
    </div>
  </div>

  <div class="mt-5">
  <h4>Grupos públicos</h4>
  <div class="row">
    <!-- Card 1 -->
    <div class="col-md-4 d-flex">
      <div class="card equal-card bg-light text-dark mb-3 w-100">
        <img src="images/upf.png" class="card-img-top" alt="UPF">
        <div class="card-body">
          <h5 class="card-title">UPF</h5>
          <p class="card-text">Apuestas en la Universidad Pompeu Fabra</p>
        </div>
      </div>
    </div>

    <!-- Card 2 -->
    <div class="col-md-4 d-flex">
      <div class="card equal-card bg-light text-dark mb-3 w-100">
        <img src="images/futbol.webp" class="card-img-top" alt="Fútbol">
        <div class="card-body">
          <h5 class="card-title">Fútbol</h5>
          <p class="card-text">Apuestas sobre el fútbol</p>
        </div>
      </div>
    </div>

    <!-- Card 3 -->
    <div class="col-md-4 d-flex">
      <div class="card equal-card bg-light text-dark mb-3 w-100">
        <img src="images/barcelona.jpg" class="card-img-top" alt="Barcelona">
        <div class="card-body">
          <h5 class="card-title">Barcelona</h5>
          <p class="card-text">Apuestas sobre Barcelona</p>
        </div>
      </div>
    </div>
  </div>
</div>


    `;
});
  