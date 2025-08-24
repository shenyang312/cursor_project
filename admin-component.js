// 管理后台功能
export function setupAdminFeatures() {
  // 编辑按钮事件绑定
  document.addEventListener('DOMContentLoaded', function() {
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
      button.addEventListener('click', function() {
        const articleId = this.dataset.id;
        // 示例跳转 - 实际应根据需求实现
        window.location.href = `/admin/edit?id=${articleId}`;
      });
    });
  });
}