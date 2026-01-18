import { test, expect } from '@playwright/test';

test.describe('Intel Sources Feature', () => {
	test('panels are hidden when feature flags are OFF (default)', async ({ page }) => {
		await page.goto('/');

		// Wait for page to load
		await expect(page.locator('h1')).toHaveText('Situation Monitor');

		// Intel Sources panels should NOT be visible with default flags
		await expect(page.locator('text=ADS-B Aircraft')).not.toBeVisible();
		await expect(page.locator('text=Satellites')).not.toBeVisible();
		await expect(page.locator('text=Spectrum Analyzer')).not.toBeVisible();
		await expect(page.locator('text=Shodan')).not.toBeVisible();
		await expect(page.locator('text=WiGLE WiFi')).not.toBeVisible();
		await expect(page.locator('text=Seismic Activity')).not.toBeVisible();
		await expect(page.locator('text=HF Propagation')).not.toBeVisible();
		await expect(page.locator('text=Aurora Activity')).not.toBeVisible();
	});

	// Note: To test with flags ON, you would need to:
	// 1. Set PUBLIC_FEATURE_INTEL_SOURCES=true in .env.test
	// 2. Set individual panel flags
	// 3. Rebuild the app
	// 4. Run tests
	//
	// Example test with flags ON (commented out):
	/*
	test('panels are visible when feature flags are ON', async ({ page }) => {
		await page.goto('/');
		
		// Wait for page to load
		await expect(page.locator('h1')).toHaveText('Situation Monitor');
		
		// At least one Intel Sources panel should be visible
		// (depending on which flags are enabled)
		const intelPanels = [
			page.locator('text=ADS-B Aircraft'),
			page.locator('text=Satellites'),
			page.locator('text=Spectrum Analyzer'),
			page.locator('text=Shodan'),
			page.locator('text=WiGLE WiFi'),
			page.locator('text=Seismic Activity'),
			page.locator('text=HF Propagation'),
			page.locator('text=Aurora Activity')
		];
		
		// Check if at least one is visible
		let foundPanel = false;
		for (const panel of intelPanels) {
			if (await panel.isVisible().catch(() => false)) {
				foundPanel = true;
				break;
			}
		}
		expect(foundPanel).toBeTruthy();
	});
	*/
});
