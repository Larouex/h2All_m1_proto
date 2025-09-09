export default function ClaimPageStatic() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>H2All - Claim Your Bottle</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: white;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .header {
      background: white;
      padding: 1rem;
      text-align: center;
      border-bottom: 1px solid #eee;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .container {
      max-width: 320px;
      margin: 0 auto;
      padding: 1rem;
      flex: 1;
    }
    .hero-image {
      width: 100%;
      height: auto;
      border-radius: 1rem;
      margin-bottom: 1rem;
      position: relative;
    }
    .hero-text {
      position: absolute;
      bottom: 1rem;
      left: 1rem;
      right: 1rem;
      color: white;
      font-size: 1.5rem;
      font-weight: bold;
      text-align: center;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }
    .claim-btn {
      width: 100%;
      padding: 1rem;
      font-size: 1.25rem;
      font-weight: bold;
      color: white;
      background: #f57c00;
      border: none;
      border-radius: 0.75rem;
      cursor: pointer;
      margin: 1rem 0;
    }
    .claim-btn:hover {
      background: #e65100;
    }
    .claim-btn:disabled {
      background: #ffcc80;
      cursor: not-allowed;
    }
    .message {
      text-align: center;
      font-size: 1.25rem;
      margin: 1rem 0;
      line-height: 1.5;
    }
    .subtext {
      text-align: center;
      color: #666;
      margin: 1rem 0;
    }
    @media (min-width: 576px) {
      .container { max-width: 450px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="/h2all-header-logo.png" alt="H2ALL WATER" height="25">
  </div>
  
  <div class="container">
    <div style="position: relative;">
      <img src="/child-water-jug.jpg" alt="Child holding a water jug" class="hero-image">
      <div class="hero-text">Your water bottle just changed a life.</div>
    </div>
    
    <button class="claim-btn" onclick="window.location.href='/emailclaim/'">
      Claim My Bottle
    </button>
    
    <p class="message">
      Millions lack clean, safe water. Your bottle helps change that.
    </p>
    
    <p class="subtext">
      Track your impact in real time, as each bottle provides access to clean and safe water.
    </p>
  </div>
  
  <script>
    // Minimal JavaScript for navigation
    document.querySelector('.claim-btn').addEventListener('click', function() {
      this.disabled = true;
      this.textContent = 'Loading...';
    });
  </script>
</body>
</html>`;
}