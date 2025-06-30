import React from 'react';
import '../styles/page.css';

const Layout = ({
  title,
  children,
  headerClass = "page-header",
  containerClass = "page-container",
  contentClass = "page-content",
  style = {},
}) => {
  return (
    <div className={containerClass} style={style}>
      {title && <header className={headerClass}>{title}</header>}
      <main className={contentClass}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
