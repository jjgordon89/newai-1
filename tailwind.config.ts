import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./src/**/*.{ts,tsx}",
		"./index.html",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				chatbot: {
					light: 'hsl(220, 70%, 97%)',
					DEFAULT: 'hsl(220, 60%, 95%)',
					dark: 'hsl(220, 30%, 20%)',
					accent: 'hsl(220, 70%, 50%)'
				},
				cyber: {
					primary: '#F97316', // Neon orange
					secondary: '#ea384c', // Neon red
					tertiary: '#8B5CF6', // Purple accent
					dark: '#161616', // Dark background
					darker: '#0A0A0A', // Darker background
					accent: '#18FFFF', // Cyan accent
					highlight: '#FFD700', // Gold highlight
					success: '#10B981', // Green success
					warning: '#FBBF24', // Amber warning
					info: '#3B82F6', // Blue info
					glow: 'rgba(249, 115, 22, 0.6)', // Orange glow
					"primary-alt": '#FF8C00', // Darker orange for contrast
					muted: '#4A4A4A', // Muted gray for less important elements
					surface: '#1E1E1E' // Surface color for cards and containers
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					from: { opacity: '0' },
					to: { opacity: '1' }
				},
				'fade-up': {
					from: { opacity: '0', transform: 'translateY(10px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-right': {
					from: { opacity: '0', transform: 'translateX(-10px)' },
					to: { opacity: '1', transform: 'translateX(0)' }
				},
				'pulse-subtle': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' }
				},
				'shimmer': {
					'0%': { backgroundPosition: '-500px 0' },
					'100%': { backgroundPosition: '500px 0' }
				},
				'glow': {
					'0%, 100%': {
						boxShadow: '0 0 5px rgba(249, 115, 22, 0.5), 0 0 10px rgba(249, 115, 22, 0.3)'
					},
					'50%': {
						boxShadow: '0 0 15px rgba(249, 115, 22, 0.7), 0 0 20px rgba(249, 115, 22, 0.5)'
					}
				},
				'ping-slow': {
					'75%, 100%': {
						transform: 'scale(1.5)',
						opacity: '0'
					}
				},
				'bounce-subtle': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-3px)' }
				},
				'breathe': {
					'0%, 100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.03)' }
				},
				'cyber-scan': {
					'0%': {
						backgroundPosition: '0% 0%',
						opacity: '0.1'
					},
					'50%': {
						opacity: '0.3'
					},
					'100%': {
						backgroundPosition: '0% 100%',
						opacity: '0.1'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'fade-up': 'fade-up 0.5s ease-out',
				'fade-right': 'fade-right 0.5s ease-out',
				'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
				'float': 'float 3s ease-in-out infinite',
				'shimmer': 'shimmer 2s infinite linear',
				'glow': 'glow 2s ease-in-out infinite',
				'ping-slow': 'ping-slow 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
				'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
				'breathe': 'breathe 4s ease-in-out infinite',
				'cyber-scan': 'cyber-scan 8s ease infinite',
				'bounce-slow': 'bounce 2s ease-in-out infinite'
			},
			boxShadow: {
				'subtle': '0 2px 10px rgba(0, 0, 0, 0.05)',
				'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
				'neomorphic': '5px 5px 15px rgba(0, 0, 0, 0.05), -5px -5px 15px rgba(255, 255, 255, 0.6)',
				'neon-orange': '0 0 5px #F97316, 0 0 10px #F97316',
				'neon-orange-lg': '0 0 10px #F97316, 0 0 20px #F97316, 0 0 30px rgba(249, 115, 22, 0.5)',
				'neon-red': '0 0 5px #ea384c, 0 0 10px #ea384c',
				'neon-cyan': '0 0 5px #18FFFF, 0 0 10px #18FFFF',
				'neon-purple': '0 0 5px #8B5CF6, 0 0 10px #8B5CF6',
				'inner-glow': 'inset 0 0 10px rgba(249, 115, 22, 0.3)',
				'cyber-card': '0 4px 16px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(249, 115, 22, 0.1)',
				'cyber-button': '0 2px 8px rgba(249, 115, 22, 0.3), 0 0 0 1px rgba(249, 115, 22, 0.2)',
				'soft-highlight': '0 -1px 0 rgba(255, 255, 255, 0.1), 0 1px 0 rgba(0, 0, 0, 0.2)'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
				'shimmer-gradient': 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%)',
				'cyber-grid': 'linear-gradient(rgba(34, 34, 34, 0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 34, 34, 0.9) 1px, transparent 1px)',
				'cyber-glow': 'radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, transparent 70%)',
				'cyber-gradient': 'linear-gradient(135deg, #161616 0%, #0f0f0f 100%)',
				'cyber-card-gradient': 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(249, 115, 22, 0.02) 100%)',
				'cyber-highlight': 'linear-gradient(to right, transparent, rgba(249, 115, 22, 0.1) 50%, transparent)',
				'cyber-scan-line': 'linear-gradient(to bottom, transparent, rgba(249, 115, 22, 0.15), transparent)',
				'noise-pattern': 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.06\'/%3E%3C/svg%3E")',
				'dotted-pattern': 'radial-gradient(rgba(249, 115, 22, 0.1) 1px, transparent 1px)',
				'vertical-gradient': 'linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.05))'
			},
			backdropBlur: {
				'xs': '2px'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
