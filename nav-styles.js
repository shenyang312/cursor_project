// 响应式导航样式
export function addNavStyles() {
  const style = document.createElement('style');
  style.textContent = `
  .nav-right {
    display: flex;
    gap: 15px;
  }

  @media (max-width: 480px) {
    .nav-right {
      flex-direction: column;
      align-items: flex-end;
    }
    
    .nav-right a {
      font-size: 14px;
      padding: 5px 10px;
    }
  }
  `;
  document.head.appendChild(style);
}