import json
import os
import random
import re
from prompts import *
from utils import extract_ps_code, gen_fewshot_examples, llm_text_query, save_prompts

def gen_game_from_plan(seed, save_dir, game_idea, n_iter):
    # fewshot = data['fewshot']
    fewshot = True
    # from_idea = data['from_idea']
    log_dir = 'logs'
    save_dir = os.path.join(log_dir, save_dir)
    os.makedirs(save_dir, exist_ok=True)
    plan_output_path = os.path.join(save_dir, f'0b_plan.txt')
    print(plan_output_path)
    if not os.path.isfile(plan_output_path):
        plan_prompt_output_path = os.path.join(save_dir, f'0a_prompt.txt')
        plan_system_prompt = game_gen_system_prompt
        from_idea_prompt_i = from_idea_prompt.format(game_idea=game_idea)
        prompt = plan_game_prompt.format(from_idea_prompt=from_idea_prompt_i)
        if fewshot:
            plan_system_prompt += gen_fewshot_examples(plan_system_prompt, prompt)   
        save_prompts(plan_system_prompt, prompt, plan_prompt_output_path)
        game_plan = llm_text_query(plan_system_prompt, prompt, seed)
        with open(plan_output_path, 'w', encoding='utf-8') as f:
            f.write(game_plan)
    else:
        with open(plan_output_path, 'r', encoding='utf-8') as f:
            game_plan = f.read()
    sprites_system_prompt = game_gen_system_prompt
    if fewshot:
        sprites_system_prompt += gen_fewshot_examples(sprites_system_prompt, '') 
    with open('example_sprite_names.txt', 'r', encoding='utf-8') as f:
        sprite_names = f.read()
    with open('example_sprites.json', 'r') as f:
        sprites_library = json.load(f)
    sprites_prompt = gen_sprites_prompt.format(game_plan=game_plan, sprites_library=sprite_names)
    sprites_output_path = os.path.join(save_dir, f'0c_sprites.txt')
    if not os.path.isfile(sprites_output_path):
        sprites_prompt_output_path = os.path.join(save_dir, f'0b_sprites_prompt.txt')
        save_prompts(sprites_system_prompt, sprites_prompt, sprites_prompt_output_path)
        sprites = llm_text_query(sprites_system_prompt, sprites_prompt, seed)
        with open(sprites_output_path, 'w', encoding='utf-8') as f:
            f.write(sprites)
        
    else:
        with open(sprites_output_path, 'r', encoding='utf-8') as f:
            sprites = f.read()

    match = re.search(r'OBJECTS\s*=+\s*(.*?)\s*=+\s*LEGEND\s*=+\s*(.*)```', sprites, re.DOTALL)
    objects = match.group(1)
    objects_list = objects.split('\n\n')
    # Find any objects that are just a name (a single line with a single word)
    for i, obj in enumerate(objects_list):
        if len(obj.split('\n')) == 1:
            obj = obj.strip()
            assert obj in sprites_library, f"Object {obj} not found in sprite library"
            objects_list[i] = random.choice(sprites_library[obj])
    object_legend = match.group(2)

    rules_system_prompt = game_gen_system_prompt
    if fewshot:
        rules_system_prompt += gen_fewshot_examples(rules_system_prompt, '')
    rules_prompt = gen_rules_prompt.format(game_plan=game_plan, object_legend=object_legend)
    rules_output_path = os.path.join(save_dir, f'0e_rules.txt')
    if not os.path.isfile(rules_output_path):
        rules_prompt_output_path = os.path.join(save_dir, f'0d_rules_prompt.txt')
        save_prompts(sprites_system_prompt, rules_prompt, rules_prompt_output_path)
        rules = llm_text_query(sprites_system_prompt, rules_prompt, seed)
        with open(rules_output_path, 'w', encoding='utf-8') as f:
            f.write(rules)
    else:
        with open(rules_output_path, 'r', encoding='utf-8') as f:
            rules = f.read()
        
    match = re.search(r'COLLISIONLAYERS\s*=+\s*(.*?)\s*=+\s*RULES\s*=+\s*((?:(?!\n=+).)*)\s*=+\s*WINCONDITIONS\s*=+\s*((?:(?!===).)*?)\s*=*\s*```', rules, re.DOTALL)
    collision_layers = match.group(1)
    rules = match.group(2)
    win_conditions = match.group(3)
    partial_code = (
        "========\nLEGEND\n========\n"
        + object_legend
        + "\n========\nCOLLISIONLAYERS\n========\n"
        + collision_layers
        + "\n========\nRULES\n========\n"
        + rules
        + "\n========\nWINCONDITIONS\n========\n"
        + win_conditions
    )

    levels_system_prompt = game_gen_system_prompt
    if fewshot:
        levels_system_prompt += gen_fewshot_examples(levels_system_prompt, '')
    levels_prompt = gen_levels_prompt.format(game_plan=game_plan, code=partial_code)
    levels_output_path = os.path.join(save_dir, f'0g_levels.txt')
    if not os.path.isfile(levels_output_path):
        levels_prompt_output_path = os.path.join(save_dir, f'0f_levels_prompt.txt')
        save_prompts(levels_system_prompt, levels_prompt, levels_prompt_output_path)
        levels = llm_text_query(levels_system_prompt, levels_prompt, seed)
        with open(levels_output_path, 'w', encoding='utf-8') as f:
            f.write(levels)
    else:
        with open(levels_output_path, 'r', encoding='utf-8') as f:
            levels = f.read()
    
    levels = re.search(r'```plaintext\s*(?:\s*=+\s*LEVELS\s*=+\s*)\s*(.*)```', levels, re.DOTALL).group(1)
    
    partial_code = (
        "========\nOBJECTS\n========\n"
        + objects
        + "\n"
        + partial_code
        + "\n========\nLEVELS\n========\n"
        + levels
    )

    finalize_system_prompt = game_gen_system_prompt
    if fewshot:
        finalize_system_prompt += gen_fewshot_examples(finalize_system_prompt, '')
    finalize_prompt = gen_finalize_prompt.format(game_plan=game_plan, code=partial_code)
    finalize_output_path = os.path.join(save_dir, f'0i_code.txt')
    if not os.path.isfile(finalize_output_path):
        finalize_prompt_output_path = os.path.join(save_dir, f'0h_code_prompt.txt')
        save_prompts(finalize_system_prompt, finalize_prompt, finalize_prompt_output_path)
        code = llm_text_query(finalize_system_prompt, finalize_prompt, seed)
        with open(finalize_output_path, 'w', encoding='utf-8') as f:
            f.write(code)
    else:
        with open(finalize_output_path, 'r', encoding='utf-8') as f:
            code = f.read()
    
    code = extract_ps_code(code)[0]

    # Add an empty SOUNDS section to the code, after the LEGEND
    code_a, code_b = code.split('\n========\nCOLLISIONLAYERS')
    code = code_a + '\n========\nSOUNDS\n========\n========\nCOLLISIONLAYERS' + code_b
    
    if 'randomDir' in code:
        skip = True
    else:
        skip = False
    # If the code we just generated has already been solved, pass it to the client so it doesn't apply the solver to it
    sols_path = os.path.join(save_dir, f'{0}l_sols.json')
    if os.path.exists(sols_path):
        with open(sols_path, 'r') as f:
            sols = json.load(f)
    else:
        sols = {}
    return code, sols, skip


def gen_game(seed, fewshot, cot, save_dir, gen_mode, parents, code, from_idea, game_idea, lark_error, console_text, 
             solver_text, compilation_success, n_iter):
    cot_prompt_text = cot_prompt if cot else ''
    log_dir = 'logs'
    save_dir = os.path.join(log_dir, save_dir)
    os.makedirs(save_dir, exist_ok=True)
    parents = [] if parents == 'None' else parents
    gen_game_response_output_path = os.path.join(save_dir, f'{n_iter}b_response.txt')
    gen_game_code_output_path = os.path.join(save_dir, f'{n_iter}b1_code.txt')
    print(f"Will save game at {gen_game_code_output_path}")
    if not os.path.isfile(gen_game_code_output_path):
        gen_game_prompt_output_path = os.path.join(save_dir, f'{n_iter}a_prompt.txt')
        system_prompt = game_gen_system_prompt
        from_idea_prompt_i = from_idea_prompt.format(game_idea=game_idea) if from_idea else ''
        if n_iter == 0:
            parents_text = '/n/n'.join([p['code'] for p in parents])
            if gen_mode == 'init':
                prompt = gen_game_prompt.format(cot_prompt=cot_prompt_text, from_idea_prompt=from_idea_prompt_i)
            elif gen_mode == 'mutate':
                prompt = game_mutate_prompt.format(parents=parents_text, cot_prompt=cot_prompt_text)
            elif gen_mode == 'crossover':
                prompt = game_crossover_prompt.format(parents=parents_text, cot_prompt=cot_prompt_text)    
        elif not compilation_success:
            if lark_error is None:
                lark_error_prompt = ''
            else:
                lark_error_prompt = f"""{("It also resulted in the following error when we attempted to parse the code as a context free grammar using lark:\n```\n{lark_error}\n```\n" if lark_error is not None else "")}"""
            prompt = game_compile_repair_prompt.format(code=code, console_text=console_text, cot_prompt=cot_prompt_text,
                                                       game_idea=game_idea, lark_error_prompt=lark_error_prompt)
        else:
            prompt = game_solvability_repair_prompt.format(code=code, solver_text=solver_text,
                                                           game_idea=game_idea)
        # if not gen_mode == GenModes.ZERO_SHOT:
        if fewshot:
            system_prompt += gen_fewshot_examples(system_prompt, prompt)
        save_prompts(system_prompt, prompt, gen_game_prompt_output_path)
        text = llm_text_query(system_prompt, prompt, seed)
        with open(gen_game_response_output_path, 'w', encoding='utf-8') as f:
            f.write(text)
    else:
        with open(gen_game_response_output_path, 'r', encoding='utf-8') as f:
            text = f.read()
    code, plaintext = extract_ps_code(text)
    if code is not None:
        with open(gen_game_code_output_path, 'w', encoding='utf-8') as f:
            f.write(code)
    if code is None or 'randomDir' in code:
        skip = True
    else:
        skip = False
    # If the code we just generated has already been solved, pass it to the client so it doesn't apply the solver to it
    sols_path = os.path.join(save_dir, f'{n_iter}l_sols.json')
    if os.path.exists(sols_path):
        with open(sols_path, 'r') as f:
            sols = json.load(f)
    else:
        sols = {}
    return code, sols, skip