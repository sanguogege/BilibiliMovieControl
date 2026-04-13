

export const OptionsFooter = () => {
    return (
        <footer style={{
            display: 'flex',
            'align-items': 'center',    // 水平居中
            'justify-content': 'center',
            width: '100%',
            padding: '20px 0',          // 增加上下内边距
            'font-size': '12px',
            color: '#888',
            gap: '4px'                  // 控制行间距
        }}>
            {/* 清除 p 标签默认 margin，防止撑开额外空间 */}
            <p style={{ margin: 0 }}>© 2026</p>
            <a
                href="https://github.com/BilibiliMovieControl"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#fb7299', 'text-decoration': 'none' }}
            >
                BilibiliMovieControl
            </a>
            <p style={{ margin: 0 }}>仅供学习与交流使用。</p>
        </footer>
    )
}