import { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Button, Paper } from '@mui/material';
import axios from 'axios';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [horses, setHorses] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, horsesRes] = await Promise.all([
                axios.get('http://localhost:5000/api/users'),
                axios.get('http://localhost:5000/api/horses')
            ]);
            setUsers(usersRes.data);
            setHorses(horsesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await axios.delete(`http://localhost:5000/api/users/${userId}`);
            fetchData();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleDeleteHorse = async (horseId) => {
        try {
            await axios.delete(`http://localhost:5000/api/horses/${horseId}`);
            fetchData();
        } catch (error) {
            console.error('Error deleting horse:', error);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Admin Dashboard
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Users
            </Typography>
            <Paper sx={{ mb: 4 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Email</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user._id}>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>
                                    <Button
                                        color="error"
                                        onClick={() => handleDeleteUser(user._id)}
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Horses
            </Typography>
            <Paper>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Breed</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Seller</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {horses.map((horse) => (
                            <TableRow key={horse._id}>
                                <TableCell>{horse.name}</TableCell>
                                <TableCell>{horse.breed}</TableCell>
                                <TableCell>${horse.price}</TableCell>
                                <TableCell>{horse.seller?.email}</TableCell>
                                <TableCell>
                                    <Button
                                        color="error"
                                        onClick={() => handleDeleteHorse(horse._id)}
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
};

export default AdminDashboard; 