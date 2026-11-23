---
title: "Photoshop Passport Photo: Size, Settings & Templates (Plus GIMP and Word)"
meta_title: "Photoshop Passport Photo: Size, GIMP & Word"
meta_description: "Make a passport photo in Photoshop, GIMP or Word: the crop size and resolution, how to put several copies on a 6 × 4 sheet, and the edits passport offices reject."
primary_keyword: "photoshop passport photo"
supporting_keywords:
  - "gimp passport photo"
  - "passport photo size in photoshop"
  - "passport photo size photoshop"
  - "passport photoshop"
  - "passport size in word"
  - "passport size photo in word"
  - "passport size photo size in photoshop"
  - "passport size picture in word"
  - "photoshop passport size"
page_number: 22
cluster: diy-tools
page_type: "Technical how-to"
hub: false
howto: true
country_code: US
intro: "A Photoshop passport photo is a normal photo cropped to an exact print size at a set resolution: 2 × 2 inches at 300 pixels per inch for a US passport, or 35 × 45 mm for the UK, Schengen countries and many others. Photoshop, the free GIMP and even Microsoft Word can all do the cropping and the print layout. This guide gives the exact settings for each, shows how to fit several copies on one 6 × 4 inch sheet, and explains which edits passport offices reject."
published: 2026-11-16
last_verified: 2026-11-16
sources:
  - name: "U.S. Department of State: Passport Photos"
    url: "https://travel.state.gov/en/passports/apply/help/photos.html"
  - name: "GOV.UK: Get a passport photo"
    url: "https://www.gov.uk/photos-for-passports/photo-requirements"
related:
  - online-passport-photo-maker
  - passport-photo-at-home
  - print-passport-photos
  - passport-photo-size
  - 2x2-passport-photo
  - passport-photo-requirements
---

## Passport photo sizes in pixels

Set the size in inches or millimetres and the resolution to 300 pixels per inch (ppi), the usual print resolution. The software then works out the pixels:

| Document | Print size | Pixels at 300 ppi | Head size (chin to top of head) |
| :--- | :--- | :--- | :--- |
| US passport and visa | 2 × 2 in | 600 × 600 | 1–1 3/8 in (300–413 px) |
| UK passport | 35 × 45 mm | 413 × 531 | 29–34 mm (343–402 px) |
| Schengen visa | 35 × 45 mm | 413 × 531 | 32–36 mm (378–425 px) |
| 6 × 4 in print sheet | 6 × 4 in | 1800 × 1200 | – |

The formula is pixels = inches × ppi, or millimetres ÷ 25.4 × ppi. For other countries, our [list of photo sizes for every country](/tool/passport-photo-size-by-country) gives the print size and head size.

Before you open any software, check two things. First, that your country accepts a photo you take yourself: Canada, for example, requires a commercial photographer. Second, that the photo itself is right: a plain white or off-white wall for the US, even light, no glasses, and nothing covering your face. Software can crop a photo; it is not allowed to fix one.

## How to make a passport photo in Photoshop

1. **Open the photo** with File > Open, and keep the original file unchanged.
2. **Choose the Crop tool** (shortcut C). In the options bar, choose **W x H x Resolution** and enter 2 in, 2 in and 300 px/in. For 35 × 45 mm, enter 3.5 cm and 4.5 cm.
3. **Turn on Delete Cropped Pixels** in the options bar, so the file is exactly the size you set.
4. **Position the crop box.** Drag the photo inside the box until your head is centred, with space above it, and scale the box so your head fills the right height: for a US photo, between 50% and 69% of the frame height.
5. **Press Enter** to crop. Check Image > Image Size: it should show 600 × 600 pixels (or 413 × 531) at 300 pixels/inch.
6. **Measure the head.** Turn on View > Rulers, set the units to inches or millimetres, and drag guides to your chin and the top of your head. If the head is outside the range, undo and crop again.
7. **Save a copy** as a JPEG at high quality, without overwriting the original.

### Canvas size and resolution

Two Photoshop menus look similar but do different things. **Image > Image Size** changes the size of the whole photo, and with **Resample** turned off it only changes the print resolution, not the pixels. **Image > Canvas Size** adds or removes space around the photo without scaling it. For a passport photo, use the Crop tool to crop and size in one step, and use Canvas Size only to build a print sheet.

Do not scale a small photo up to reach 600 pixels. Enlarging adds blur rather than detail, and a blurry photo is rejected. Start from the full-size photo from your camera or phone.

### Background

Photoshop can select a person and replace what is behind them, but passport offices check for exactly that. The US State Department says: "Do not change your photo using computer software, phone apps or filters," and it checks photos for digital alteration. If the background is grey, patterned or shadowed, take the photo again against a plain wall instead of editing it.

### Layout multiple copies on one sheet

1. **Create the sheet** with File > New: 6 inches wide, 4 inches high, 300 pixels/inch, white background (1800 × 1200 pixels).
2. **Copy the cropped photo in.** With both files open, use the Move tool to drag the photo onto the sheet, or copy and paste it.
3. **Duplicate it** with Layer > Duplicate Layer and move the copy across, leaving a gap of a few millimetres to cut along.
4. **Save the sheet as a JPEG** at full quality.
5. **Print at 100%.** In Photoshop's Print dialog, turn off **Scale to Fit Media** and leave the scale at 100%, or take the JPEG to a photo kiosk as a normal 6 × 4 print.

Two US 2 × 2 inch photos fit on a 6 × 4 sheet with room to cut. Six fit only edge to edge, with no margin. Six 35 × 45 mm photos fit with cutting gaps.

## Passport photo in GIMP (free)

GIMP is a free image editor for Windows, Mac and Linux, and it does everything a passport photo needs:

1. **Open the photo** with File > Open.
2. **Choose the Crop tool.** In Tool Options, tick **Fixed** and choose **Aspect ratio**, then type 1:1 for a US photo or 35:45 for 35 × 45 mm.
3. **Draw the crop** so your head is centred and fills the right height, then press Enter.
4. **Set the size** with Image > Scale Image: 600 × 600 pixels (or 413 × 531) and a resolution of 300 pixels/in.
5. **Export** with File > Export As, using a .jpg name and a high quality setting.

For a print sheet, create a new 1800 × 1200 pixel image at 300 ppi (File > New, then the advanced options for resolution), paste the photo in as a new layer, duplicate the layer and move the copies into place.

## Passport size photo in Word

Word is a good way to print a photo at an exact size, but it cannot measure your head or check the pixels. Crop and size the photo in an image editor first if you can, and use Word for the layout.

1. **Insert the photo** with Insert > Pictures.
2. **Crop to shape.** Select the picture, then use Picture Format > Crop > Aspect Ratio > 1:1 for a US photo. Drag the photo inside the crop frame to centre your head, then click outside the picture.
3. **Set the exact size.** In the Size group of the Picture Format tab, type a height of 2" (or 4.5 cm). With the aspect ratio locked, the width follows.
4. **Add copies** by copying and pasting the picture, with a small space between them.
5. **Print at actual size.** Do not use "scale to paper size" or "fit to page", and choose photo paper in the printer settings.

Word has no 7:9 ratio for 35 × 45 mm photos. Use the crop handles and the Size group together until the picture is 3.5 cm wide and 4.5 cm high, and check that the photo is not stretched. Word can also compress pictures when you save; turning compression off in Word's options keeps the photo sharp.

## Retouching limits

| Edit | Allowed? |
| :--- | :--- |
| Cropping and resizing to the required size | Yes |
| Straightening a tilted head | No: retake with your head level |
| Brightening a dark photo | Not for a US photo: retake in better light |
| Removing blemishes, smoothing skin, whitening teeth | No |
| Removing or replacing the background | No |
| Removing glasses glare, red eye or shadows | No: retake the photo |
| Filters, beauty modes or AI enhancement | No |

The UK says photos must not be altered with computer software, and the US says to "submit the original, unchanged photo." Our [passport photo rules checklist](/tool/passport-photo-requirements) lists every rule a photo has to meet.

## Free templates

You do not need a downloaded template. A template is just a blank 6 × 4 inch canvas at 300 ppi with the photo boxes marked, and you can save your own:

- **Photoshop:** make the 1800 × 1200 sheet, drag guides to the edges of each photo, and save it as a PSD. Next time, paste the new photo in and line it up with the guides.
- **GIMP:** do the same and save it as an XCF file.
- **Word:** set the paper size to 6 × 4 in or 10 × 15 cm, insert a table with cells the size of your photo, and save it as a Word template.

The free [passport photo sheet maker](/passport-photo-print-template-generator) lays out copies of a finished photo on a 6 × 4 sheet without any software.

## The online alternative

The slowest part in any program is getting the head size right, because you crop, measure and crop again. The [online photo maker](/tool/online-passport-photo-maker) finds your face, crops to your country's size and head height, and gives you the digital file and a print sheet. For a US passport it only crops and sizes the photo, so the background stays exactly as you took it.

## Frequently Asked Questions

### What size is a passport photo in Photoshop?

For a US passport, 2 × 2 inches at 300 pixels per inch, which is 600 × 600 pixels. For a 35 × 45 mm photo, 3.5 × 4.5 cm at 300 ppi, which is 413 × 531 pixels.

### Is it legal to edit a passport photo in Photoshop?

Cropping and resizing are fine; they are how every passport photo is made. Changing how you or the background look is not accepted. The US State Department rejects photos changed with software, apps, filters or AI.

### Can I make a passport photo in Word?

Yes, for the print layout. Word can crop a photo to a square and set it to exactly 2 × 2 inches, but it cannot check your head size, so measure the printed photo before you use it.

### What resolution should a passport photo be?

300 pixels per inch is the usual print resolution. Online applications set their own rules, so check the file size and pixel limits for the form you are filling in.

### Is GIMP good enough for a passport photo?

Yes. GIMP's crop tool can lock the shape to 1:1 or 35:45, and its scale and print size settings give the same result as Photoshop, free.
