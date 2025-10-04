<script lang="ts">
  import senpAIImage from '$lib/assets/senpAI.png'
  
  let isHovered = $state(false)
</script>

<div 
  class="floating-mascot"
  class:hovered={isHovered}
  role="img"
  aria-label="SenpAI mascot"
  onmouseenter={() => isHovered = true}
  onmouseleave={() => isHovered = false}
>
  <img 
    src={senpAIImage} 
    alt="SenpAI mascot" 
    class="mascot-image"
  />
</div>

<style>
  .floating-mascot {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 80px;
    height: 80px;
    cursor: pointer;
    z-index: 1000;
    transition: all 0.3s ease;
    border-radius: 50%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background: white;
    padding: 8px;
  }

  .floating-mascot:hover {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  }

  .mascot-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-8px);
    }
  }

  /* Mobile responsive */
  @media (max-width: 640px) {
    .floating-mascot {
      width: 60px;
      height: 60px;
      bottom: 16px;
      right: 16px;
    }
  }
</style>

