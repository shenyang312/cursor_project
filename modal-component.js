// 模态框HTML结构
export function createArticleModal() {
  const modalHTML = `
  <div id="articleModal" class="modal">
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2 id="modalTitle"></h2>
      <div id="modalContent"></div>
    </div>
  </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// 模态框样式
export function addModalStyles() {
  const style = document.createElement('style');
  style.textContent = `
  /* 模态框样式 */
  .modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0,0,0,0.4);
  }

  .modal-content {
    background-color: #fff;
    margin: 15% auto;
    padding: 20px;
    border: 1px solid #888;
    width: 70%;
    border-radius: 8px;
  }

  .close {
    float: right;
    cursor: pointer;
    font-size: 24px;
    font-weight: bold;
  }

  @media (max-width: 768px) {
    .modal-content {
      width: 90%;
      margin: 10% auto;
    }
  }
  `;
  document.head.appendChild(style);
}

// 模态框交互逻辑
export function setupModalEvents() {
  const modal = document.getElementById('articleModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalContent = document.getElementById('modalContent');

  document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('read-more')) {
      e.preventDefault();
      const articleId = e.target.dataset.id;
      // 示例数据 - 实际应从API获取
      modalTitle.textContent = `文章 ${articleId} 详情`;
      modalContent.innerHTML = `<p>这是文章 ${articleId} 的完整内容。</p>`;
      modal.style.display = 'block';
    }
  });

  document.querySelector('.close')?.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', function(event) {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  });
}