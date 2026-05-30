import os
import testmu
from testmu import expect, var, set_var
from playwright.async_api import Page

testmu.configure(
    build="197ac57a-014f-485a-98af-80033c2e81a8",
    name="Submit a Form",
    tc_id="TC-3",
    network=True,
    variables={"__cp_final": "true"},
    default_action_timeout_ms=10000,
    default_navigation_timeout_ms=30000,
)

@testmu.test
async def test(page: Page):
    async with testmu.step('Open https://kaneai-playground.lambdatest.io/'):
        await page.goto("https://kaneai-playground.lambdatest.io/")
    
    async with testmu.step('Switching to the Mobile App step'):
        _loc_1 = page.locator("role=tab[name='Mobile App']")
        
        await _loc_1.click()
    
    async with testmu.step('PRIMARY: a success confirmation message stating the first test was automated is visible | HINTS: center of the page below a green checkmark Always answer true/false, nothing else.'):
        set_var('__cp_final', await testmu.vision_query(page, "PRIMARY: a success confirmation message stating the first test was automated is visible | HINTS: center of the page below a green checkmark Always answer true/false, nothing else.", ""))
    
    async with testmu.step('Assertion check'):
        await testmu.verify_assertion(page, 'Assertion check', {'operator': ['equals'], 'assertion_operands': [], 'left_operand': None, 'right_operand': None, 'operands': [], 'sub_results': [{'description': 'Final verification — confirm the objective is fully achieved', 'passed': True, 'operator': 'equals', 'transforms': [], 'expected': 'true', 'extracted_value': '{{__cp_final}}', 'store_key': '__cp_final', 'variable_refs': {'{{__cp_final}}': 'true'}}], 'sub_checks': [{'description': 'Final verification — confirm the objective is fully achieved', 'store_key': '__cp_final', 'expected_value': 'true', 'stored_value': '{{__cp_final}}', 'operator': 'equals', 'transforms': []}], 'composite_operator': 'and', 'claim': 'kane/flow1-submit.txt'})


if __name__ == "__main__":
    testmu.run(test)