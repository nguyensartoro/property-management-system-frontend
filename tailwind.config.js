/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', 'class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				'50': 'var(--primary-50)',
  				'100': 'var(--primary-100)',
  				'200': 'var(--primary-200)',
  				'300': 'var(--primary-300)',
  				'400': 'var(--primary-400)',
  				'500': 'var(--primary-500)',
  				'600': 'var(--primary-600)',
  				'700': 'var(--primary-700)',
  				'800': 'var(--primary-800)',
  				'900': 'var(--primary-900)',
  				'950': 'var(--primary-950)',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				'50': 'var(--secondary-50)',
  				'100': 'var(--secondary-100)',
  				'200': 'var(--secondary-200)',
  				'300': 'var(--secondary-300)',
  				'400': 'var(--secondary-400)',
  				'500': 'var(--secondary-500)',
  				'600': 'var(--secondary-600)',
  				'700': 'var(--secondary-700)',
  				'800': 'var(--secondary-800)',
  				'900': 'var(--secondary-900)',
  				'950': 'var(--secondary-950)',
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))',
  				background: 'var(--destructive-background)'
  			},
  			success: {
  				'400': '#4caf50',
  				'500': '#10b981',
  				DEFAULT: 'hsl(var(--success))',
  				foreground: 'hsl(var(--success-foreground))'
  			},
  			warning: {
  				'400': '#f59e0b',
  				DEFAULT: 'hsl(var(--warning))',
  				foreground: 'hsl(var(--warning-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))',
  				background: 'var(--muted-background)'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))',
  				background: 'var(--accent-background)'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))',
  				background: 'var(--popover-background)'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))',
  				background: 'var(--card-background)'
  			},
  			danger: {
  				'400': '#ff6b6b',
  				'500': '#ef4444'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Be Vietnam Pro"',
  				'Inter',
  				'system-ui',
  				'sans-serif'
  			],
  			vietnam: [
  				'Be Vietnam Pro"',
  				'sans-serif'
  			],
  			inter: [
  				'Inter',
  				'sans-serif'
  			],
  			roboto: [
  				'Roboto',
  				'sans-serif'
  			],
  			opensans: [
  				'Open Sans"',
  				'sans-serif'
  			]
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			DEFAULT: 'var(--radius)'
  		},
  		fontSize: {
  			xs: 'var(--font-size-xs)',
  			sm: 'var(--font-size-sm)',
  			base: 'var(--font-size-base)',
  			lg: 'var(--font-size-lg)',
  			xl: 'var(--font-size-xl)',
  			'2xl': 'var(--font-size-2xl)',
  			'3xl': 'var(--font-size-3xl)',
  			'4xl': 'var(--font-size-4xl)'
  		},
  		keyframes: {
  			slideDown: {
  				'0%': {
  					opacity: 0,
  					transform: 'translateY(-10px)'
  				},
  				'100%': {
  					opacity: 1,
  					transform: 'translateY(0)'
  				}
  			}
  		},
  		animation: {
  			slideDown: 'slideDown 0.2s ease-out forwards'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};