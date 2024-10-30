import React from 'react';
import { Breadcrumb as BootstrapBreadcrumb } from 'react-bootstrap';

const Breadcrumb = ({ title }) => {
    return (
        <>
            {title !== 'NODISPLAY' && (
                <div
                    style={{
                        position: 'fixed',
                        top: '45px',
                        backgroundColor: '#f8f9fa',
                        zIndex: 1040,
                        borderBottom: '1px solid #ddd',
                    }}
                >
                    <BootstrapBreadcrumb style={{ fontSize: '.7rem', margin: '0', padding: '5px 10px', height: '20px' }}>
                        <BootstrapBreadcrumb.Item href="/">Home</BootstrapBreadcrumb.Item>
                        <BootstrapBreadcrumb.Item active>{title}</BootstrapBreadcrumb.Item>
                    </BootstrapBreadcrumb>
                </div>
            )}
        </>
    );
};

export default Breadcrumb;
