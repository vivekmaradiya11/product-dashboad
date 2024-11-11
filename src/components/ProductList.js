import React, { useState, useEffect } from 'react';
import { Table, Container, FormControl, InputGroup, Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import '../css/ProductCard.css';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const itemsPerPage = 4;
    const [addnewproductModal, setAddnewproductModal] = useState(false);
    const [editproductModal, setEditproductModal] = useState(false);
    const [editProductData, setEditProductData] = useState(null);
    const [expandedProductIds, setExpandedProductIds] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        price: '',
        description: '',
        category: '',
        rating: { rate: '', count: '' }
    });

    const [errors, setErrors] = useState({});


    useEffect(() => {
        getdata()
    }, []);

    const getdata = () => {
        axios.get('https://fakestoreapi.com/products')
            .then((response) => {
                setProducts(response.data);
            })
            .catch((error) => {
                console.error('Error fetching products:', error);
            });
    }

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handlePaginationChange = (page) => {
        setCurrentPage(page);
    };

    const filteredProducts = products.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.price.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const productedit = (product) => {
        setEditProductData(product);
        setEditproductModal(true);
    };

    const productdelete = (id) => {
        axios.delete(`https://fakestoreapi.com/products/${id}`)
            .then(response => {
                setProducts(products.filter(product => product.id !== id));
                console.log('Product deleted:', response.data);
            })
            .catch(error => {
                console.error('Error deleting product:', error);
            });
    };

    const handleSaveEditedProduct = () => {
        if (editProductData) {
            axios.put(`https://fakestoreapi.com/products/${editProductData.id}`, editProductData)
                .then(response => {
                    setProducts(products.map(product =>
                        product.id === editProductData.id ? editProductData : product
                    ));
                    setEditproductModal(false);
                    console.log('Product updated:', response.data);
                })
                .catch(error => {
                    console.error('Error updating product:', error);
                });
        }
    };

    const toggleReadMore = (id) => {
        setExpandedProductIds(prevState =>
            prevState.includes(id) ? prevState.filter(productId => productId !== id) : [...prevState, id]
        );
    };

    // Form validation
    const validateForm = () => {
        let formErrors = {};
        if (!formData.title) formErrors.title = 'Title is required';
        if (!formData.price || isNaN(formData.price)) formErrors.price = 'Valid price is required';
        if (!formData.description) formErrors.description = 'Description is required';
        if (!formData.category) formErrors.category = 'Category is required';
        setErrors(formErrors);
        return Object.keys(formErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const productData = {
                ...formData,
                rating: formData.rating
            };
            axios.post('https://fakestoreapi.com/products', productData)
                .then(response => {
                    setFormData({ title: '', price: '', description: '', category: '', rating: { rate: '', count: '' } });
                    setAddnewproductModal(false);
                    const newProduct = {
                        ...response.data,
                        rating: response.data.rating || { rate: formData.rating.rate, count: formData.rating.count }
                    };
                    setProducts(prevProducts => [...prevProducts, newProduct]);
                })
                .catch(error => {
                    console.error(error);
                });
        }
    };

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'rate' || name === 'count') {
            setFormData({
                ...formData,
                rating: { ...formData.rating, [name]: value }
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    return (
        <>
            <div className="container main_section_search_edit px-0">
                <div className="main_section_search_edit container-fluid my-3 d-flex align-items-center flex-column flex-md-row">
                    <div className="main_section_search col-12 col-md-8">
                        <InputGroup>
                            <FormControl
                                type="text"
                                placeholder="Search product..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </InputGroup>
                    </div>
                    <div className="main_section_edit col-12 col-md-4 text-center mt-3 mt-md-0">
                        <Button variant="success" onClick={() => setAddnewproductModal(true)}>Add New Product</Button>
                    </div>
                </div>

                <div className="mani_content_section">
                    {paginatedProducts.map((data) => (
                        <div className="product-card" key={data.id}>
                            <div className="product-info">
                                <h3>{data.category}</h3>
                                <p className='text-start mb-1'>{data.title}</p>
                                <div className='w-100'>
                                   <div className='d-flex justify-content-between'> 
                                   <p className='text-start mb-1'>
                                        <strong>Count: </strong><span className='text-danger'>{data.rating.count}</span>
                                    </p>
                                    <p className='text-start mb-1'>
                                        <strong>Rate: </strong><span className='text-warning'>{data.rating.rate}</span>
                                    </p>
                                   </div>
                                    <p className='text-start mb-1'><strong>Price: </strong><span className='text-success'>{data.price}</span></p>
                                    <p className='text-start mb-2'>
                                    <strong>Description: </strong>
                                    <span className='text-secondary'>
                                        {expandedProductIds.includes(data.id)
                                            ? data.description
                                            : `${data.description.length > 40 ? data.description.slice(0, 40) + '...' : data.description}`}
                                        </span>
                                        <span onClick={() => toggleReadMore(data.id)} style={{ color: 'blue', cursor: 'pointer' }}>
                                            {expandedProductIds.includes(data.id) ? 'Read Less' : 'Read More'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div className="product-actions">
                                <Button variant="info" onClick={() => productedit(data)}>Edit</Button>
                                <Button variant="danger" onClick={() => productdelete(data.id)}>Delete</Button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pagination d-flex justify-content-end mt-2">
                    {Array.from({ length: Math.ceil(filteredProducts.length / itemsPerPage) }, (_, index) => (
                        <Button
                            key={index + 1}
                            onClick={() => handlePaginationChange(index + 1)}
                            variant={index + 1 === currentPage ? 'success' : 'light'}
                            className='mx-1 border '
                        >
                            {index + 1}
                        </Button>
                    ))}
                </div>
            </div>

            <Modal show={addnewproductModal} onHide={() => setAddnewproductModal(false)} size="md" centered >
                <Modal.Header closeButton>
                    <Modal.Title>Add New Product</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form >
                        <div className="my-1">
                            <label htmlFor="title" className="form-label"><h6 className='mb-0'>Title</h6></label>
                            <input type="text" className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                                id="title" name="title" placeholder="Enter title" value={formData.title} onChange={handleChange} />
                            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                        </div>

                        <div className="my-1">
                            <label htmlFor="price" className="form-label"><h6 className='mb-0'>Price</h6></label>
                            <input type="number" className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                                id="price" name="price" placeholder="Enter price" value={formData.price} onChange={handleChange} />
                            {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                        </div>

                        <div className="my-1">
                            <label htmlFor="description" className="form-label"><h6 className='mb-0'>Description</h6></label>
                            <textarea className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                                id="description" name="description" placeholder="Enter descripation" rows="3" value={formData.description}
                                onChange={handleChange}  ></textarea>
                            {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                        </div>

                        <div className="my-1">
                            <label htmlFor="category" className="form-label"><h6 className='mb-0'>Category</h6></label>
                            <input type="text" className={`form-control ${errors.category ? 'is-invalid' : ''}`}
                                id="category" name="category" placeholder="Enter category" value={formData.category} onChange={handleChange}
                            />
                            {errors.category && <div className="invalid-feedback">{errors.category}</div>}
                        </div>

                        <div className="d-flex justify-content-between my-1">
                            <div>
                                <label className="form-label my-2"><h6 className='mb-0'>Rating</h6></label>
                                <input type="number" name="rate"
                                    value={formData.rating.rate || ""} onChange={handleChange} className="form-control me-2"
                                    placeholder="Enter rating" />
                            </div>
                            <div>
                                <label className="form-label my-2"><h6 className='mb-0'>Count</h6></label>
                                <input type="number" name="count" value={formData.rating.count || ""} onChange={handleChange}
                                    className="form-control" placeholder="Enter Count" />
                            </div>
                        </div>
                        <div className='text-center mt-4'>
                            <button  onClick={(e)=>handleSubmit(e) } className="btn btn-primary">Submit</button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>

            <Modal show={editproductModal} onHide={() => setEditproductModal(false)} size="md" centered >
                <Modal.Header closeButton>
                    <Modal.Title>Edit Product</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editProductData && (
                        <div className='d-flex flex-column'>
                            <label className="form-label my-2"><h6 className='mb-0'>Name</h6></label>
                            <input
                                type="text"
                                value={editProductData.title || ""}
                                onChange={(e) => setEditProductData({ ...editProductData, title: e.target.value })}
                                className="form-control"
                                placeholder="Product Title"
                            />

                            <label className="form-label my-2"><h6 className='mb-0'>Category</h6></label>
                            <input
                                type="text"
                                value={editProductData.category || ""}
                                onChange={(e) => setEditProductData({ ...editProductData, category: e.target.value })}
                                className="form-control"
                                placeholder="Product Category"
                            />

                            <label className="form-label my-2"><h6 className='mb-0'>Price</h6></label>
                            <input
                                type="number"
                                value={editProductData.price || ""}
                                onChange={(e) => setEditProductData({ ...editProductData, price: e.target.value })}
                                className="form-control"
                                placeholder="Product Price"
                            />

                            <label className="form-label my-2"><h6 className='mb-0'>Description</h6></label>
                            <textarea
                                value={editProductData.description || ""}
                                onChange={(e) => setEditProductData({ ...editProductData, description: e.target.value })}
                                className="form-control"
                                placeholder="Product Description"
                            />

                            <div className="d-flex justify-content-between">
                                <div>
                                    <label className="form-label my-2"><h6 className='mb-0'>Rating</h6></label>
                                    <input
                                        type="number"
                                        value={editProductData.rating?.rate || ""}
                                        onChange={(e) => setEditProductData({
                                            ...editProductData,
                                            rating: { ...editProductData.rating, rate: e.target.value }
                                        })}
                                        className="form-control me-2"
                                        placeholder="Rating"
                                    />
                                </div>
                                <div>
                                    <label className="form-label my-2"><h6 className='mb-0'>Count</h6></label>
                                    <input
                                        type="number"
                                        value={editProductData.rating?.count || ""}
                                        onChange={(e) => setEditProductData({
                                            ...editProductData,
                                            rating: { ...editProductData.rating, count: e.target.value }
                                        })}
                                        className="form-control"
                                        placeholder="Rating Count"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    <div className='text-center mt-4'>
                        <button className="btn btn-primary mx-1" onClick={handleSaveEditedProduct}>Save Changes</button>
                        <button className="btn btn-danger mx-1" onClick={() => setEditproductModal(false)}>Close</button>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default ProductList;
