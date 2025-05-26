import { useEffect } from 'react';

const TestView = () => {
const getTestData = async (testId: string) => {
    try {
        const apiUrl= import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/api/testdata/${testId}`);
        const data = await response.json();
        console.log('Hämtade testdata:', data);
    } catch (error) {
        console.error('Fel vid hämtning av testdata:', error);
    }
};

useEffect(() => {
    getTestData('test-id-123');
}, []);

return (
    <div>
        <h1>Testvy</h1>
        
    </div>
);
};
export default TestView;