import Link from 'next/link'
import { Newspaper, Mail, Facebook, Twitter, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Newspaper className="h-6 w-6 text-primary-400" />
              <span className="text-xl font-bold text-white">ClassinNews</span>
            </div>
            <p className="text-sm">
              Your trusted source for quality journalism and engaging stories from around the world.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-primary-400">Home</Link>
              </li>
              <li>
                <Link href="/articles" className="hover:text-primary-400">All Articles</Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-primary-400">Categories</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-bold mb-4">Popular Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/category/technology" className="hover:text-primary-400">Technology</Link>
              </li>
              <li>
                <Link href="/category/business" className="hover:text-primary-400">Business</Link>
              </li>
              <li>
                <Link href="/category/sports" className="hover:text-primary-400">Sports</Link>
              </li>
              <li>
                <Link href="/category/entertainment" className="hover:text-primary-400">Entertainment</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-bold mb-4">Stay Updated</h3>
            <p className="text-sm mb-4">Subscribe to our newsletter for the latest news</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-primary-400">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary-400">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary-400">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary-400">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <Link href="/privacy-policy" className="hover:text-primary-400">Privacy Policy</Link>
            <span className="text-gray-600">•</span>
            <Link href="/terms" className="hover:text-primary-400">Terms of Service</Link>
            <span className="text-gray-600">•</span>
            <Link href="/data-deletion" className="hover:text-primary-400">Data Deletion</Link>
          </div>
          <p>&copy; {new Date().getFullYear()} ClassinNews. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
