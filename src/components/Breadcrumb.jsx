import React from 'react';
import { Breadcrumbs, Button, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Breadcrumb = ({ title }) => {
    return (
        <>
            {title !== 'NODISPLAY' && (
                <div
                    style={{
                        position: 'fixed',
                        top: '56px',
                        marginLeft: 0,
                        backgroundColor: '#fff',
                        zIndex: 1040,
                        borderBottom: '1px solid #ddd',
                        padding: '0px 5px',

                    }}
                >
                    <Breadcrumbs
                        aria-label="breadcrumb"
                        sx={{
                            fontSize: '.7rem',
                            margin: 0,
                            padding: 0,
                            height: '20px',
                        }}
                    >


                        <Button
                            component={RouterLink}
                            to="/"
                            variant="text"
                            color="inherit"
                            sx={{
                                textTransform: 'none',
                                fontSize: '.7rem',
                                padding: 0,
                                height: '20px',
                                minWidth: 'auto',
                                lineHeight: 1.5,
                                color: 'primary.main'
                            }}
                        >
                            Home
                        </Button>
                        <Typography color="text.primary" sx={{ fontSize: '.7rem', padding: 0 }}>
                            {title}
                        </Typography>
                    </Breadcrumbs>
                </div>
            )}
        </>
    );
};

export default Breadcrumb;
