import React from 'react';

const Footer = () => {
    const footerLinks = {
        "About us": ["About", "Careers", "Press", "Brand guidelines"],
        "Products": ["Hoshiyaar", "Hoshiyaar for Schools", "Hoshiyaar English Test", "Hoshiyaar ABC", "Hoshiyaar Math", "Super Hoshiyaar"],
        "Apps": ["Hoshiyaar for Android", "Hoshiyaar for iOS"],
        "Help and support": ["Hoshiyaar Help Center", "Terms", "Privacy"],
        "Social": ["Blog", "Instagram", "Facebook", "Twitter", "YouTube"]
    };

    return (
        <footer className="bg-duo-blue text-white pt-20 pb-10">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-10 justify-items-center">
                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title} className="flex flex-col items-start">
                            <h3 className="font-bold mb-4 text-center">{title}</h3>
                            <ul className="flex flex-col items-start">
                                {links.map(link => (
                                    <li key={link} className="mb-2">
                                        <a href="#" className="text-gray-300 hover:text-white text-start">{link}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="border-t border-gray-700 pt-8 mt-8 text-center text-gray-400">
                    <p>Hoshiyaar tests are not a substitute for official language certification.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;