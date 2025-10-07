<script lang="ts">
  import senpAIImage from '$lib/assets/senpAI.png'
  
  let isHovered = $state(false)
  let showMessage = $state(false)
  
  function handleClick() {
    showMessage = true
    setTimeout(() => {
      showMessage = false
    }, 3000)
  }
</script>

<div class="mascot-container">
  {#if showMessage}
    <div class="message-box">
      <div class="message-content">
        Beep, boop, I'm still a work in progress!
      </div>
      <div class="message-arrow"></div>
    </div>
  {/if}
  
  <div 
    class="floating-mascot"
    class:hovered={isHovered}
    role="button"
    tabindex="0"
    aria-label="SenpAI mascot - click for message"
    onmouseenter={() => isHovered = true}
    onmouseleave={() => isHovered = false}
    onclick={handleClick}
    onkeydown={(e) => e.key === 'Enter' && handleClick()}
  >
    <img 
      src={senpAIImage} 
      alt="SenpAI mascot" 
      class="mascot-image"
    />
  </div>
</div>

<style>
  .mascot-container {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 1000;
  }

  .message-box {
    position: absolute;
    bottom: 100px;
    right: 0;
    background: #1f2937;
    color: white;
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    max-width: 200px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease-out;
  }

  .message-content {
    margin-bottom: 8px;
  }

  .message-arrow {
    position: absolute;
    bottom: -6px;
    right: 20px;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid #1f2937;
  }

  .floating-mascot {
    width: 80px;
    height: 80px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .floating-mascot:hover {
    transform: scale(1.1) rotate(5deg);
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

  @keyframes slideIn {
    0% {
      opacity: 0;
      transform: translateY(10px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Mobile responsive */
  @media (max-width: 640px) {
    .mascot-container {
      bottom: 16px;
      right: 16px;
    }
    
    .floating-mascot {
      width: 60px;
      height: 60px;
    }
    
    .message-box {
      bottom: 80px;
      max-width: 160px;
      font-size: 12px;
    }
  }
</style>

