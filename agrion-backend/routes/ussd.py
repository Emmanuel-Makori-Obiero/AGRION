"""
Africa's Talking inbound USSD webhook.
"""
import logging
import os
import threading  # Added for background asynchronous tasks
import requests
import secrets    # Added for secure coupon generation
import string     # Added for character sets
import json       # Added to update sms_outbox.json directly
from datetime import datetime
from flask import Blueprint, Response, request

from services.ai_engine import get_advice, get_or_generate_context
from services.consent import has_consented, hash_phone, record_consent
from services.knowledge_graph import get_crop_context, log_farmer_query
from services.sms_store import store_advice, is_short_enough_for_ussd

ussd_bp = Blueprint("ussd", __name__)

USSD_MAX_CHARS = 160
SMS_MAX_CHARS  = 150

LANGUAGES = {"1": "en", "2": "ha", "3": "yo", "4": "ig", "5": "pcm"}
CROPS = ["maize", "cassava", "rice", "yam", "cocoa", "cowpea"]

I18N = {
    "en": {
        "main_menu": (
            "CON Select service:\n1. Crop Advisory\n2. Weather Updates\n"
            "3. Market Prices\n4. My Data & Privacy\n5. Voice Assistance"
        ),
        "crop_menu": (
            "CON Crop Advisory:\n1. Top Crops\n2. Search by Name\n"
            "3. Identify via Photo\n4. Voice Description"
        ),
        "choose_crop": "CON Choose crop:\n",
        "type_crop": "CON Type your crop name\n(e.g. sorghum, millet, pepper):",
        "describe_problem": "CON Describe your {} problem in a few words:",
        "describe_problem_free": "CON Describe your {} problem in a few words:",
        "mms_info": "END Send your crop photo to 80353. AI will diagnose and reply via MMS.",
        "voice_info": "END Stay on the line. We are calling you now for voice advice.",
        "ivr_trigger": "END Please wait. We are calling you in your local dialect.",
        "ivr_failed": "END Could not initiate call. Try again or SMS your question.",
        "weather_info": "END Weather updates coming soon. Check back shortly.",
        "market_info": "CON Market Prices coming soon.\n0. Back",
        "ndpa_menu": (
            "CON My Data (NDPA 2023):\n1. View my data\n2. Rectify my data\n"
            "3. Erase my data\n4. Privacy Policy"
        ),
        "ndpa_view": "END Your recent queries are stored securely under NDPA 2023.",
        "ndpa_rectify": "END Send corrections to support@agrion.ng. We act within 72hrs.",
        "ndpa_erase_confirm": "CON Erase ALL records? Cannot be undone.\n1. Yes, Erase\n2. Cancel",
        "ndpa_erase_done": "END Your data has been erased. Thank you for using Agrion.",
        "ndpa_policy": "END Full policy: agrion.ng/privacy — NDPA 2023 compliant.",
        "sms_sent": "END Advice processed successfully.\nRetrieval Code: ",
        "sms_failed": "END {}",
        "invalid": "END Invalid option. Dial *384*55# to start again.",
    },
    "ha": {
        "main_menu": (
            "CON Zaɓi sabis:\n1. Shawarar Amfanin Gona\n2. Labarin Yanayi\n"
            "3. Farashin Kasuwa\n4. Bayanan Na\n5. Taimakon Murya"
        ),
        "crop_menu": (
            "CON Shawarar Amfanin Gona:\n1. Manyan Amfanin Gona\n2. Bincika da Suna\n"
            "3. Gano ta Hoto\n4. Kwatanta da Murya"
        ),
        "choose_crop": "CON Zaɓi amfanin gona:\n",
        "type_crop": "CON Rubuta sunan amfanin gona\n(misali: dawa, gero, tattasai):",
        "describe_problem": "CON Kwatanta matsalar {} da 'yan kalmomi:",
        "describe_problem_free": "CON Kwatanta matsalar {} da 'yan kalmomi:",
        "mms_info": "END Aika hoton amfanin gonarka zuwa 80353.",
        "voice_info": "END Jira akan layi. Muna kirana yanzu.",
        "ivr_trigger": "END Da fatan za a jira. Muna kirana da yarenku.",
        "ivr_failed": "END Ba a iya fara kira. Sake gwadawa ko aika SMS.",
        "weather_info": "END Bayanan yanayi na zuwa.",
        "market_info": "CON Farashin Kasuwa na zuwa.\n0. Koma",
        "ndpa_menu": (
            "CON Bayanan Na (NDPA 2023):\n1. Duba bayanan na\n2. Gyara bayanan na\n"
            "3. Share bayanan na\n4. Manufofin Sirri"
        ),
        "ndpa_view": "END Tambayoyinku na baya an adana su lafiya karkashin NDPA 2023.",
        "ndpa_rectify": "END Aika gyare-gyare zuwa support@agrion.ng.",
        "ndpa_erase_confirm": "CON Share duk bayanan? Ba za a iya dawowa ba.\n1. Ee, Share\n2. Soke",
        "ndpa_erase_done": "END An share bayananku. Nagode da amfani da Agrion.",
        "ndpa_policy": "END Cikakken manufa: agrion.ng/privacy",
        "sms_sent": "END An adana bayanan cikin nasara.\nLambar Taimako: ",
        "sms_failed": "END {}",
        "invalid": "END Zaɓi mara inganci. Buga *384*55# don farawa.",
    },
    # (Keep yo, ig, and pcm structures completely identical to your layout)
    "yo": {
        "main_menu": "CON Yan iṣẹ:\n1. Imọran Irugbin\n2. Iroyin Oju Ojo\n3. Iye Oja\n4. Data Mi\n5. Iranlowo Ohun",
        "crop_menu": "CON Imọran Irugbin:\n1. Awon Irugbin Akọkọ\n2. Wa nipasẹ Orukọ\n3. Damo nipasẹ Foto\n4. Apejuwe Ohun",
        "choose_crop": "CON Yan irugbin:\n",
        "type_crop": "CON Tẹ orukọ irugbin rẹ\n(apẹẹrẹ: sorghum, ata, ẹpa):",
        "describe_problem": "CON Ṣapejuwe iṣoro {} ni awon ọrọ diẹ:",
        "describe_problem_free": "CON Ṣapejuwe iṣoro {} ni awon ọrọ diẹ:",
        "mms_info": "END Fi foto irugbin re ranṣẹ si 80353.",
        "voice_info": "END Duro lori laini. A n pe o ni bayi.",
        "ivr_trigger": "END Jọwọ duro. A n pe o ni ede abinibi rẹ.",
        "ivr_failed": "END Ko le bẹrẹ ipe. Gbiyanju lẹẹkansi.",
        "weather_info": "END Iroyin oju ojo n bọ.",
        "market_info": "CON Iye Oja n bọ.\n0. Pada",
        "ndpa_menu": "CON Data Mi (NDPA 2023):\n1. Wo data mi\n2. Ṣe atunṣe data mi\n3. Pa data mi run\n4. Eto Ikọkọ",
        "ndpa_view": "END Awon ibeere rẹ ti o kọja ni a tọju ni aabo.",
        "ndpa_rectify": "END Fi atunṣe ranṣẹ si support@agrion.ng.",
        "ndpa_erase_confirm": "CON Pa gbogbo data run?\n1. Bẹẹni, Pa Run\n2. Fagilee",
        "ndpa_erase_done": "END Data rẹ ti parun. E dupe fun lilo Agrion.",
        "ndpa_policy": "END Eto ni kikun: agrion.ng/privacy",
        "sms_sent": "END Imọran ti fipamọ daradara.\nKoodu rẹ: ",
        "sms_failed": "END {}",
        "invalid": "END Aṣayan ti ko tọ. Pe *384*55# lati bẹrẹ.",
    },
    "ig": {
        "main_menu": "CON Họrọ ọrụ:\n1. Ndụmọdụ Ọjị\n2. Ihe Ọhụrụ Ihu Igwe\n3. Ọnụahịa Ahịa\n4. Data M\n5. Enyemaka Olu",
        "crop_menu": "CON Ndụmọdụ Ọjị:\n1. Ọjị Bụ Isi\n2. Chọọ site na Aha\n3. Chọpụta site na Foto\n4. Nkọwa Olu",
        "choose_crop": "CON Họrọ ọjị:\n",
        "type_crop": "CON Dee aha ọjị gị\n(ọmụmaatụ: sorghum, ose, groundnut):",
        "describe_problem": "CON Kọwaa nsogbu {} n'okwu ole na ole:",
        "describe_problem_free": "CON Kọwaa nsogbu {} n'okwu ole na ole:",
        "mms_info": "END Zipu foto ọjị gị na 80353.",
        "voice_info": "END Nọrọ n'ahịrị. Anyị na-akpọ gị ugbu a.",
        "ivr_trigger": "END Biko chere. Anyị na-akpọ gị n'asụsụ obodo gị.",
        "ivr_failed": "END Enweghị ike ịmalite oku. Nwaa ọzọ.",
        "weather_info": "END Ihe ọhụrụ ihu igwe na-abịa.",
        "market_info": "CON Ọnụahịa Ahịa na-abịa.\n0. Laghachi",
        "ndpa_menu": "CON Data M (NDPA 2023):\n1. Lee data m\n2. Dozie data m\n3. Hichapụ data m\n4. Iwu Nzuzo",
        "ndpa_view": "END Ajụjụ gị ndị gara aga edekọtara ha nchekwa.",
        "ndpa_rectify": "END Zipu ndozi na support@agrion.ng.",
        "ndpa_erase_confirm": "CON Hichapụ akọrọ niile?\n1. Ee, Hichapụ\n2. Kagbuo",
        "ndpa_erase_done": "END Ehichapụla data gị. Daalụ maka iji Agrion.",
        "ndpa_policy": "END Iwu zuru ezu: agrion.ng/privacy",
        "sms_sent": "END Echekwara ndụmọdụ nke ọma.\nKoodu gị: ",
        "sms_failed": "END {}",
        "invalid": "END Nhọrọ adịghị mma. Kpọọ *384*55# iji malite.",
    },
    "pcm": {
        "main_menu": "CON Pick wetin you want:\n1. Crop Advice\n2. Weather News\n3. Market Price\n4. My Data\n5. Voice Help",
        "crop_menu": "CON Crop Advice:\n1. Top Crops\n2. Search by Name\n3. Send Photo\n4. Voice Talk",
        "choose_crop": "CON Pick crop:\n",
        "type_crop": "CON Type the crop name\n(e.g. sorghum, millet, pepper):",
        "describe_problem": "CON Tell us wetin do your {} in small small words:",
        "describe_problem_free": "CON Tell us wetin do your {} in small small words:",
        "mms_info": "END Send your crop photo go 80353.",
        "voice_info": "END Wait for call. We go ring you now.",
        "ivr_trigger": "END Wait small. We dey call you for your language.",
        "ivr_failed": "END Call no fit start. Try again or send SMS.",
        "weather_info": "END Weather update dey come.",
        "market_info": "CON Market Price dey come.\n0. Go back",
        "ndpa_menu": "CON My Data (NDPA 2023):\n1. See my data\n2. Fix my data\n3. Delete my data\n4. Privacy Policy",
        "ndpa_view": "END Your old questions dey safe under NDPA 2023.",
        "ndpa_rectify": "END Send correction go support@agrion.ng.",
        "ndpa_erase_confirm": "CON You sure say you wan delete everything?\n1. Yes, Delete\n2. Cancel",
        "ndpa_erase_done": "END We don delete your data. Thanks for using Agrion.",
        "ndpa_policy": "END Full policy: agrion.ng/privacy",
        "sms_sent": "END Advice don record well.\nYour Code na: ",
        "sms_failed": "END {}",
        "invalid": "END Option no correct. Dial *384*55# to start again.",
    }
}


def _generate_coupon_code() -> str:
    """Generates a unique 6-character uppercase alphanumeric code."""
    return "".join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))


def get_localized_string(lang_code: str, key: str) -> str:
    return I18N.get(lang_code, I18N["en"]).get(key, I18N["en"].get(key, ""))


def trigger_voice_callback(phone_number: str) -> bool:
    api_key   = os.getenv("AT_API_KEY")
    username  = os.getenv("AT_USERNAME", "sandbox")
    caller_id = os.getenv("AT_CALLER_ID", "")
    if not api_key or not caller_id:
        logging.warning("[ussd] AT_API_KEY or AT_CALLER_ID not set.")
        return False
    try:
        resp = requests.post(
            "https://voice.africastalking.com/call",
            data={"username": username, "to": phone_number, "from": caller_id},
            headers={"apiKey": api_key, "Accept": "application/json"},
            timeout=10,
        )
        return resp.status_code == 200
    except Exception as e:
        logging.error(f"[ussd] Voice callback failed: {e}")
        return False


def send_sms_reply(phone_number: str, message: str) -> bool:
    if len(message) > SMS_MAX_CHARS:
        message = message[:SMS_MAX_CHARS - 3].rstrip() + "..."
    log_path = os.path.join(os.path.dirname(__file__), "..", "sms_outbox.log")
    try:
        with open(os.path.abspath(log_path), "a", encoding="utf-8") as f:
            f.write(f"[{datetime.now().isoformat()}] TO={phone_number} | MSG={message}\n")
        logging.info(f"[sms] Logged for {phone_number}: {message}")
        return True
    except Exception as e:
        logging.error(f"[sms] Log failed: {e}")
        return False

 
def _run_advice_and_sms_worker(
    phone_number: str,
    phone_hash: str,
    crop: str,
    question: str,
    lang: str,
    coupon_code: str,  # Injected coupon key
) -> None:
    """Safely runs AI generation and explicitly saves payload into sms_outbox.json"""
    try:
        if not has_consented(phone_hash):
            record_consent(phone_hash, True)

        context = get_or_generate_context(crop, get_crop_context)
        advice  = get_advice(question, context, language_hint=lang, channel="sms")

        if not advice:
            advice = "Could not generate advice. Please describe the problem differently."

        log_farmer_query(phone_hash, crop, question, channel="ussd")
        send_sms_reply(phone_number, advice)
        store_advice(phone_hash, advice)

        # ── EXPLICIT SAVE TO SMS_OUTBOX.JSON FOR THE SMS SIMULATOR BYPASS ──
        json_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "sms_outbox.json"))
        outbox_data = {}
        
        if os.path.exists(json_path):
            try:
                with open(json_path, "r", encoding="utf-8") as f:
                    outbox_data = json.load(f)
            except Exception:
                outbox_data = {}

        # Construct payload schema identical to your existing JSON structure
        outbox_data[coupon_code] = {
            "phone_hash": phone_hash,
            "advice": advice,
            "ts": datetime.now().isoformat(),
            "retrieved": False
        }

        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(outbox_data, f, indent=4)
            
        logging.info(f"[ussd_worker] Successfully auto-saved code {coupon_code} to system memory.")

    except Exception as e:
        logging.error(f"[ussd_worker] Background pipeline exception: {e}")


@ussd_bp.route("/ussd", methods=["POST"])
def ussd_callback():
    phone_number = request.values.get("phoneNumber", "")
    text         = request.values.get("text", "")
    phone_hash   = hash_phone(phone_number)

    steps = [s for s in text.split("*") if s != ""] if text else []

    # ── LEVEL 0: Language Selection ───────────────────────────────────
    if len(steps) == 0:
        return Response(
            "CON Welcome to Agrion. Select Language:\n"
            "1. English\n2. Hausa\n3. Yoruba\n4. Igbo\n5. Pidgin",
            mimetype="text/plain"
        )

    lang_key = steps[0]
    if lang_key not in LANGUAGES:
        return Response(I18N["en"]["invalid"], mimetype="text/plain")
    lang = LANGUAGES[lang_key]

    # ── LEVEL 1: Main Menu ────────────────────────────────────────────
    if len(steps) == 1:
        return Response(get_localized_string(lang, "main_menu"), mimetype="text/plain")

    menu_choice = steps[1]

    # ── BRANCH 1: Crop Advisory ───────────────────────────────────────
    if menu_choice == "1":

        if len(steps) == 2:
            response = get_localized_string(lang, "crop_menu")

        elif len(steps) == 3:
            sub_choice = steps[2]
            if sub_choice == "1":
                options  = "\n".join(f"{i+1}. {c.title()}" for i, c in enumerate(CROPS))
                response = get_localized_string(lang, "choose_crop") + options
            elif sub_choice == "2":
                response = get_localized_string(lang, "type_crop")
            elif sub_choice == "3":
                response = get_localized_string(lang, "mms_info")
            elif sub_choice == "4":
                response = (
                    get_localized_string(lang, "voice_info")
                    if trigger_voice_callback(phone_number)
                    else get_localized_string(lang, "ivr_failed")
                )
            else:
                response = get_localized_string(lang, "invalid")

        elif len(steps) == 4:
            sub_choice = steps[2]

            if sub_choice == "1":
                try:
                    crop_idx = int(steps[3]) - 1
                    if 0 <= crop_idx < len(CROPS):
                        crop     = CROPS[crop_idx]
                        response = get_localized_string(lang, "describe_problem").format(crop.title())
                    else:
                        response = get_localized_string(lang, "invalid")
                except ValueError:
                    response = get_localized_string(lang, "invalid")

            elif sub_choice == "2":
                crop     = steps[3].strip().lower()
                response = get_localized_string(lang, "describe_problem_free").format(crop.title())

            else:
                response = get_localized_string(lang, "invalid")

        elif len(steps) >= 5:
            sub_choice = steps[2]
            
            # Generate the unique coupon code immediately in the parent stream
            coupon_code = _generate_coupon_code()

            if sub_choice == "1":
                try:
                    crop     = CROPS[int(steps[3]) - 1]
                    question = " ".join(steps[4:])
                    
                    threading.Thread(
                        target=_run_advice_and_sms_worker,
                        args=(phone_number, phone_hash, crop, question, lang, coupon_code)
                    ).start()
                    
                    response = get_localized_string(lang, "sms_sent") + coupon_code
                except (ValueError, IndexError):
                    response = get_localized_string(lang, "invalid")

            elif sub_choice == "2":
                crop     = steps[3].strip().lower()
                question = " ".join(steps[4:])
                
                threading.Thread(
                    target=_run_advice_and_sms_worker,
                    args=(phone_number, phone_hash, crop, question, lang, coupon_code)
                ).start()
                
                response = get_localized_string(lang, "sms_sent") + coupon_code

            else:
                response = get_localized_string(lang, "invalid")

        else:
            response = get_localized_string(lang, "invalid")

    # ── BRANCH 2: Weather ─────────────────────────────────────────────
    elif menu_choice == "2":
        response = get_localized_string(lang, "weather_info")

    # ── BRANCH 3: Market Prices ───────────────────────────────────────
    elif menu_choice == "3":
        if len(steps) == 2:
            response = get_localized_string(lang, "market_info")
        elif len(steps) == 3 and steps[2] == "0":
            response = get_localized_string(lang, "main_menu")
        else:
            response = get_localized_string(lang, "invalid")

    # ── BRANCH 4: NDPA 2023 ───────────────────────────────────────────
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
            if steps[3] == "1":
                record_consent(phone_hash, False)
                response = get_localized_string(lang, "ndpa_erase_done")
            elif steps[3] == "2":
                response = get_localized_string(lang, "main_menu")
            else:
                response = get_localized_string(lang, "invalid")
        else:
            response = get_localized_string(lang, "invalid")

    # ── BRANCH 5: IVR Voice Bridge ────────────────────────────────────
    elif menu_choice == "5":
        response = (
            get_localized_string(lang, "ivr_trigger")
            if trigger_voice_callback(phone_number)
            else get_localized_string(lang, "ivr_failed")
        )

    else:
        response = get_localized_string(lang, "invalid")

    return Response(response, mimetype="text/plain")