import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-gray-50 border-t border-gray-100 text-gray-600 font-[raleway]">
            <div className="max-w-screen-xl mx-auto px-8 max-sm:px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold bg-gradient-to-bl from-violet-500 to-purple-800 text-transparent bg-clip-text">
                        Portify
                    </span>
                    <span className="text-gray-400 text-sm">— Your portfolio, simplified.</span>
                </div>

                <nav className="flex gap-5 text-sm font-medium flex-wrap justify-center">
                    <Link to="/" className="text-gray-500 hover:text-purple-700 transition-colors">Home</Link>
                    <Link to="/sign-up" className="text-gray-500 hover:text-purple-700 transition-colors">Sign up</Link>
                    <Link to="/sign-in" className="text-gray-500 hover:text-purple-700 transition-colors">Sign in</Link>
                </nav>

                <p className="text-sm text-gray-400 text-center">
                    Made with 💛 by{' '}
                    <a
                        href="https://www.linkedin.com/in/harsh-jain-10467a22b/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-500 hover:text-amber-600 font-medium transition-colors"
                    >
                        Harsh Jain
                    </a>
                </p>
            </div>
        </footer>
    );
}
