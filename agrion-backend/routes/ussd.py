"""
Africa's Talking USSD Webhook implementation for Agrion offline interface (*384*55#).
Handles multi-dialect localized state routing, NDPA-compliant flows, and IVR triggers.
"""
from flask import Blueprint, request, Response

from services.ai_engine import get_advice, get_or_generate_context
from services.call_service import trigger_voice_callback
from services.consent import has_consented, hash_phone, record_consent
from services.knowledge_graph import get_crop_context, log_farmer_query

ussd_bp = Blueprint("ussd", __name__)

# Core Content Arrays
CROPS = ["Maize", "Cassava", "Rice", "Yam", "Cocoa", "Cowpea"]
LANGUAGES = {"1": "en", "2": "ha", "3": "yo", "4": "ig", "5": "pcm"}

# Complete Translation Mapping for the Multi-Dialect State Machine
I18N = {
    "en": {
        "main_menu": "CON Welcome to Agrion. Choose an option:\n1. Crop Advisory\n2. Weather Updates\n3. Market Prices (Coming Soon)\n4. My Data & Privacy (NDPA)\n5. Voice Assistance (Call Me)",
        "crop_menu": "CON Crop Advisory:\n1. Top Crops\n2. Search by Name\n3. Identify via Photo (MMS)\n4. Voice Description (IVR)",
        "choose_crop": "CON Choose your crop:\n",
        "describe_problem": "CON Describe your {} problem\n(e.g., yellow leaves, spots):",
        "mms_info": "END Send your crop photo to 38455. Our AI will automatically identify the crop and the problem. You will receive an MMS diagnostic.",
        "voice_info": "END Stay on the line. We are calling you to record your voice description. Alfred's AI will analyze your speech.",
        "weather_info": "END Weather updates are arriving shortly via SMS. High rainfall expected this week.",
        "market_info": "CON Market Prices (Coming Soon).\n0. Back",
        "ndpa_menu": "CON Your data is protected by NDPA 2023:\n1. View my data\n2. Rectify my data\n3. Erase my data\n4. Privacy Policy Summary",
        "ndpa_view": "END You have active diagnostic logs matching your number hash. All tracking data is strictly pseudonymous under NDPA.",
        "ndpa_rectify": "END To update your regional metadata or profile details, please complete your profiling using option 5 for Voice Assistance.",
        "ndpa_erase_confirm": "CON Are you sure you want to erase all your records? This cannot be undone.\n1. Yes, Erase\n2. No, Cancel",
        "ndpa_erase_done": "END Your consent has been withdrawn and your records have been erased successfully.",
        "ndpa_policy": "END Privacy Summary: Agrion only records a non-reversible hash of your MSISDN. No corporate sharing occurs.",
        "ivr_trigger": "END Please wait... We are initiating an instant callback in your local dialect.",
        "ivr_failed": "END Callback engine is temporarily busy. Please use the Text Menu or dial again shortly.",
        "invalid": "END Invalid selection. Please dial the shortcode again."
    },
    "ha": {
        "main_menu": "CON Barka da zuwa Agrion. Zaɓi zaɓi:\n1. Shawarwari Akan Amfanin Gona\n2. Rahoton Yanayi\n3. Farashin Kasuwa (Kusa Kusa)\n4. Bayanai Na & Sirri (NDPA)\n5. Taimakon Muryar Wayar (Kira Ni)",
        "crop_menu": "CON Shawarwari Akan Amfanin Gona:\n1. Manyan Amfanin Gona\n2. Bincika ta Suna\n3. Gane ta Hoton Wayar (MMS)\n4. Bayanin Murya (IVR)",
        "choose_crop": "CON Zaɓi amfanin gona na ku:\n",
        "describe_problem": "CON Kwatanta matsalar {} ku\n(misali ganyen rawaya, dige-dige):",
        "mms_info": "END Aika hoton amfanin gona zuwa 38455. AI namu zai gane matsalar ta atomatik kuma zaku sami saƙon bincike na MMS.",
        "voice_info": "END Tsaya akan layi. Muna kiran ku don yin rikodin bayanin muryar ku. Alfred AI zai bincika maganarku.",
        "weather_info": "END Rahoton yanayi zai zo muku ta SMS nan ba da jimawa ba.",
        "market_info": "CON Farashin Kasuwa (Kusa Kusa).\n0. Koma Baya",
        "ndpa_menu": "CON An kiyaye bayanan ku ƙarƙashin NDPA 2023:\n1. Dubi bayanai na\n2. Gyara bayanai na\n3. Goge bayanai na\n4. Takaitaccen Manufar Sirri",
        "ndpa_view": "END Kuna da bayanan bincike masu aiki da lambarku ƙarƙashin NDPA.",
        "ndpa_rectify": "END Don gyara bayanan yankinku, da fatan za a yi amfani da Taimakon Murya ta zaɓi na 5.",
        "ndpa_erase_confirm": "CON Shin kun tabbata kuna son goge duk bayanan ku? Wannan ba za a iya soke shi ba.\n1. Ee, Goge\n2. A'a, Soke",
        "ndpa_erase_done": "END An cire yardar ku kuma an goge bayanan ku cikin nasara.",
        "ndpa_policy": "END Takaitaccen Sirri: Agrion yana riƙe da lambar ku ne kawai a ɓoye. Babu raba bayanai.",
        "ivr_trigger": "END Da fatan za a jira... Muna ƙaddamar da kiran ku yanzu a cikin yaren ku.",
        "ivr_failed": "END Injin kiran muryar yana da matsala a halin yanzu. Da fatan za a sake gwadawa nan ba da jimawa ba.",
        "invalid": "END Zaɓin da ba daidai ba. Da fatan za a sake buga lambar."
    },
    "yo": {
        "main_menu": "CON Kaabo si Agrion. Yan aṣayan kan:\n1. Imọran lori Irúgbìn\n2. Iroyin Oju-ọjọ\n3. Awọn Idiyele Ọjà (Laipẹ)\n4. Data mi & Aṣiri (NDPA)\n5. Iranlọwọ Ohùn (Pe mi)",
        "crop_menu": "CON Imọran lori Irúgbìn:\n1. Awọn Irúgbìn Pataki\n2. Wa nipasẹ Orukọ\n3. Ṣe idanimọ nipasẹ Fọto (MMS)\n4. Apejuwe Ohùn (IVR)",
        "choose_crop": "CON Yan irúgbìn rẹ:\n",
        "describe_problem": "CON Ṣe apejuwe iṣoro rẹ lori {}:\n(apere: ewe gbigbe)",
        "mms_info": "END Fi fọto irúgbìn rẹ ranṣẹ si 38455. AI wa yoo ṣe idanimọ iṣoro naa laifọwọyi.",
        "voice_info": "END Duro lori ila. A n pe ọ pada lati gba alaye ohùn rẹ silẹ.",
        "weather_info": "END Iroyin oju-ọjọ yoo de si ori foonu rẹ nipasẹ SMS laipẹ.",
        "market_info": "CON Awọn Idiyele Ọjà (Laipẹ n bọ).\n0. Pada",
        "ndpa_menu": "CON A daabobo data rẹ labẹ NDPA 2023:\n1. Wo data mi\n2. Ṣe atunṣe data mi\n3. Pa data mi rẹ\n4. Akopọ Ilana Aṣiri",
        "ndpa_erase_confirm": "CON Ṣe o da ọ loju pe o fẹ pa gbogbo data rẹ rẹ? Ko ṣee ṣe lati mu pada.\n1. Bẹẹni, Pa rẹ\n2. Rara, Fagilee",
        "ndpa_erase_done": "END A ti pa data rẹ rẹ kuro lori ẹrọ wa.",
        "ivr_trigger": "END Jọwọ duro... A n gbe ipe ohùn rẹ lọwọ ni ede rẹ.",
        "invalid": "END Aṣayan ti ko tọ. Jọwọ tẹ koodu naa lẹẹkan sii."
    },
    "ig": {
        "main_menu": "CON Nnabata na Agrion. Họrọ otu:\n1. Ndụmọdụ Ihe Ọkụkụ\n2. Ihu Igwe\n3. Onu Ahia (Na-abịa Adị)\n4. Data m & Nzuzo (NDPA)\n5. Enyemaka Olu (Kpọọ m)",
        "crop_menu": "CON Ndụmọdụ Ihe Ọkụkụ:\n1. Ihe Ọkụkụ Ndị Isi\n2. Chọọ site na Aha\n3. Jiri Fọto Chọpụta (MMS)\n4. Nkọwa Olu (IVR)",
        "choose_crop": "CON Họrọ ihe ọkụkụ gị:\n",
        "describe_problem": "CON Kọwaa nsogbu gị na {}:\n(dika: akwụkwọ ndụ anwụọla)",
        "mms_info": "END Zipu fọto ihe ọkụkụ gị na 38455. AI anyị ga-achọpụta nsogbu ahụ ozugbo.",
        "voice_info": "END Jide n'ahịrị. Anyị na-akpọ gị ugbu a ka ị dekọọ nkọwa olu gị.",
        "weather_info": "END Akụkọ ihu igwe ga-erute gị site na SMS n'oge na-adịghị anya.",
        "market_info": "CON Onu Ahia (Na-abịa Adị).\n0. Azụ",
        "ndpa_menu": "CON Echekwara data gị n'okpuru NDPA 2023:\n1. Lelee data m\n2. Dozie data m\n3. Hichapụ data m\n4. Nchịkọta Ndị Onye Nzuzo",
        "ndpa_erase_confirm": "CON Ì doro gị anya na ị chọrọ ihichapụ data gị niile? Wannan enweghị ike ịmegharị.\n1. Ee, Hichapụ\n2. Mba, Kagbuo",
        "ndpa_erase_done": "END Ehichapụla data gị niile nke ọma.",
        "ivr_trigger": "END Biko chere... Anyị na-amalite oku olu ozugbo n'asụsụ gị.",
        "invalid": "END Nhọrọ na-adịghị mma. Biko pịa koodu ahụ ọzọ."
    },
    "pcm": {
        "main_menu": "CON Welcome to Agrion. Choose wetin you wan do:\n1. Crop Advisory\n2. Weather Updates\n3. Market Prices (Coming Soon)\n4. My Data & Privacy (NDPA)\n5. Voice Assistance (Call Me)",
        "crop_menu": "CON Crop Advisory:\n1. Top Crops\n2. Search by Name\n3. Identify via Photo (MMS)\n4. Voice Description (IVR)",
        "choose_crop": "CON Pick your crop:\n",
        "describe_problem": "CON Text details of your {} problem:\n(e.g., yellow leaves)",
        "mms_info": "END Send your crop photo go 38455. Our AI go automatically find the issue for you.",
        "voice_info": "END Stay on top line. We dey call you back to record your voice now.",
        "weather_info": "END Weather news dey enter your phone via SMS inside small time.",
        "market_info": "CON Market Prices dey come soon.\n0. Back",
        "ndpa_menu": "CON Your data de secure under NDPA 2023 laws:\n1. View my data\n2. Rectify my data\n3. Erase my data\n4. Privacy Policy Summary",
        "ndpa_erase_confirm": "CON You dey sure say you wan delete your information? You no go fit get am back o.\n1. Yes, Erase\n2. No, Cancel",
        "ndpa_erase_done": "END We don clear all your records from our system fully.",
        "ivr_trigger": "END Abeg wait... We dey pull your automated dialect callback now.",
        "invalid": "END Invalid selection. Abeg dial the shortcode again."
    }
}

def get_localized_string(lang_code: str, key: str) -> str:
    """Helper to cleanly extract text with a safe global English fallback."""
    return I18N.get(lang_code, I18N["en"]).get(key, I18N["en"].get(key, ""))

@ussd_bp.route("/ussd", methods=["POST"])
def ussd_callback():
    phone_number = request.values.get("phoneNumber", "")
    text = request.values.get("text", "")
    phone_hash = hash_phone(phone_number)

    steps = [s for s in text.split("*") if s != ""] if text else []

    # ── LEVEL 0: Dial-In Language Selection Screen ───────────────────
    if len(steps) == 0:
        return Response(
            "CON Welcome to Agrion. Select Language:\n"
            "1. English\n"
            "2. Hausa\n"
            "3. Yoruba\n"
            "4. Igbo\n"
            "5. Pidgin",
            mimetype="text/plain"
        )

    # Resolve Dialect Configuration based on Step 0 Input
    lang_key = steps[0]
    if lang_key not in LANGUAGES:
        return Response(I18N["en"]["invalid"], mimetype="text/plain")
        
    lang = LANGUAGES[lang_key]

    # ── LEVEL 1: Localized Context Main Menu ──────────────────────────
    if len(steps) == 1:
        response = get_localized_string(lang, "main_menu")
        return Response(response, mimetype="text/plain")

    # ── LEVEL 2+: Main Modular Routing Infrastructure ─────────────────
    menu_choice = steps[1]

    # BRANCH 1: Crop Advisory Workflow
    if menu_choice == "1":
        if len(steps) == 2:
            response = get_localized_string(lang, "crop_menu")
            
        elif len(steps) == 3:
            sub_choice = steps[2]
            if sub_choice == "1":    # Top Crops Array
                options = "\n".join(f"{i + 1}. {c}" for i, c in enumerate(CROPS))
                response = get_localized_string(lang, "choose_crop") + options
            elif sub_choice == "2":  # Search by Name
                response = f"CON {get_localized_string(lang, 'choose_crop')}"
            elif sub_choice == "3":  # MMS Redirect Hook
                response = get_localized_string(lang, "mms_info")
            elif sub_choice == "4":  # Outbound Voice Bridge Request
                if trigger_voice_callback(phone_number):
                    response = get_localized_string(lang, "voice_info")
                else:
                    response = get_localized_string(lang, "ivr_failed")
            else:
                response = get_localized_string(lang, "invalid")

        elif len(steps) == 4:
            # Handle specific crop index validation
            try:
                crop_idx = int(steps[3]) - 1
                if 0 <= crop_idx < len(CROPS):
                    crop = CROPS[crop_idx]
                    response = get_localized_string(lang, "describe_problem").format(crop)
                else:
                    response = get_localized_string(lang, "invalid")
            except ValueError:
                response = get_localized_string(lang, "invalid")

        elif len(steps) >= 5:
            try:
                crop = CROPS[int(steps[3]) - 1]
                question = "*".join(steps[4:])  # Preserves nested user tokens

                if not has_consented(phone_hash):
                    record_consent(phone_hash, True)

                context = get_or_generate_context(crop, get_crop_context)
                advice = get_advice(question, context, language_hint=lang, channel="ussd")
                log_farmer_query(phone_hash, crop, question, channel="ussd")
                
                response = f"END {advice}"
            except (ValueError, IndexError):
                response = get_localized_string(lang, "invalid")

    # BRANCH 2: Weather Ingestion Webhook Trigger
    elif menu_choice == "2":
        response = get_localized_string(lang, "weather_info")

    # BRANCH 3: Coming Soon Market Gateway Loop
    elif menu_choice == "3":
        if len(steps) == 2:
            response = get_localized_string(lang, "market_info")
        elif len(steps) == 3 and steps[2] == "0":
            response = get_localized_string(lang, "main_menu")
        else:
            response = get_localized_string(lang, "invalid")

    # BRANCH 4: NDPA 2023 Compliance Management Protocol
    elif menu_choice == "4":
        if len(steps) == 2:
            response = get_localized_string(lang, "ndpa_menu")
        elif len(steps) == 3:
            ndpa_choice = steps[2]
            if ndpa_choice == "1":
                response = get_localized_string(lang, "ndpa_view")
            elif ndpa_choice == "2":
                response = get_localized_string(lang, "ndpa_rectify")
            elif ndpa_choice == "3":
                response = get_localized_string(lang, "ndpa_erase_confirm")
            elif ndpa_choice == "4":
                response = get_localized_string(lang, "ndpa_policy")
            else:
                response = get_localized_string(lang, "invalid")
        elif len(steps) == 4 and steps[2] == "3":
            erase_confirm = steps[3]
            if erase_confirm == "1":
                record_consent(phone_hash, False)
                response = get_localized_string(lang, "ndpa_erase_done")
            elif erase_confirm == "2":
                response = get_localized_string(lang, "main_menu")
            else:
                response = get_localized_string(lang, "invalid")
        else:
            response = get_localized_string(lang, "invalid")

    # BRANCH 5: Pure Telephony-IVR Outbound Bridge System
    elif menu_choice == "5":
        if trigger_voice_callback(phone_number):
            response = get_localized_string(lang, "ivr_trigger")
        else:
            response = get_localized_string(lang, "ivr_failed")

    else:
        response = get_localized_string(lang, "invalid")

    return Response(response, mimetype="text/plain")