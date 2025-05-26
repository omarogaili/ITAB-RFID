import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Style from '../Styles/DisplayTestResult.module.css';
import { Scrollbar } from 'react-scrollbars-custom';

const DisplayTestResult = () => {
    // useState used to handle the images
    const [images, setImages] = useState<{ name: string; data: string }[]>([]);
    // useState used to handle : filtered images and search query. 
    const [filteredImages, setFilteredImages] = useState<{ name: string; data: string }[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    // useState used to handle the loading state.
    const [isLoading, setIsLoading] = useState(true);
    // useState used to navigate.
    const navigate = useNavigate();

    const fetchImages = async () => {
        // Fetch images from the backend API
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await fetch(`${apiUrl}/api/all_images`);
            const data = await response.json();
            setImages(data.images);
            setFilteredImages(data.images);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching images:", error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Fetch images when the component mounts
        fetchImages();
        const interval = setInterval(fetchImages, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value.toLowerCase(); // Convert to lowercase for case-insensitive search 
        setSearchQuery(query);
        const filtered = images.filter((img) => img.name.toLowerCase().includes(query));
        setFilteredImages(filtered); // Update filtered images based on search query
    };

    const handleImageClick = (imageName: string) => {
        navigate(`/test-result/${imageName}`);
    };

    return (
        <div className={Style.MainContainer}>
            {isLoading ? <p>Loading...</p> : null}
            <div>
                <input
                    type="text"
                    placeholder="Search for an image..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className={Style.SearchInput}
                />
            </div>
            <Scrollbar style={{ width: "100%", height: "60vh" }}>
            <div>
                { filteredImages.length >0 ?(filteredImages.map((img) => (
                    <div key={img.name} className={Style.ImageContainer} onClick={() => handleImageClick(img.name)}>
                        <img
                            src={`data:image/png;base64,${img.data}`}
                            alt={img.name}
                            style={{ width: "150px", height: "150px", objectFit: "cover", borderRadius: "10px" }}
                        />
                        <p>{img.name}</p>
                    </div>
                ))) : (
                    <p>No images found.</p>
                )}
            </div>
        </Scrollbar>
        </div>
    );
};

export default DisplayTestResult;